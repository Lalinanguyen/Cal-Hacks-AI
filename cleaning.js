import Papa from 'papaparse';
import { Asset } from 'expo-asset';
import { getAIRankedScore } from './CSRanking';

// --- Configuration ---
// Set these values to control the filtering and ranking process.
const FILTER_COLUMN = 'Major'; // The column to check for the keyword (e.g., 'Major', 'Skills').
const FILTER_KEYWORD = 'Data Science'; // The keyword to identify the students you want to rank.
const DUPLICATE_CHECK_COLUMN = 'Name'; // The column to use for removing duplicates.

// The name of the column to sort the data by.
const SORT_BY_COLUMN = 'Name'; 

// Sort order: 'asc' for ascending, 'desc' for descending.
const SORT_ORDER = 'asc';

/**
 * Filters the CSV data for a specific group (e.g., Data Science students),
 * gets an AI-generated score for each unique user in that group,
 * and sorts them to create a ranked leaderboard.
 *
 * @returns {Promise<Array>} A promise that resolves with the final ranked leaderboard data.
 */
export const getRankedLeaderboardData = async () => {
  try {
    const asset = Asset.fromModule(require('./assets/allcsdata.csv'));
    await asset.downloadAsync();
    const response = await fetch(asset.uri);
    const csvString = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // --- 1. Filter for the specific group (e.g., Data Science) ---
            console.log(`Filtering for students with '${FILTER_KEYWORD}' in the '${FILTER_COLUMN}' column...`);
            const filteredData = results.data.filter(row => {
                const fieldValue = row[FILTER_COLUMN];
                return fieldValue && fieldValue.toLowerCase().includes(FILTER_KEYWORD.toLowerCase());
            });

            // --- 2. Remove Duplicates from the filtered list ---
            const uniqueData = [];
            const seen = new Set();
            filteredData.forEach(row => {
              const identifier = row[DUPLICATE_CHECK_COLUMN];
              if (identifier && !seen.has(identifier)) {
                seen.add(identifier);
                uniqueData.push(row);
              }
            });

            // --- 3. Get AI Score for each unique student in the group ---
            console.log(`Getting AI scores for ${uniqueData.length} Data Science students...`);
            const scoredDataPromises = uniqueData.map(user => {
                const profile = {
                    experience: [{ text: user.Experience || '' }],
                    education: [{ text: user.Education || '' }],
                    skills: user.Skills ? user.Skills.split(',').map(s => s.trim()) : []
                };
                return getAIRankedScore(profile).then(score => ({ ...user, score }));
            });

            const scoredData = await Promise.all(scoredDataPromises);
            
            // --- 4. Sort by Score (Best to Worst) ---
            scoredData.sort((a, b) => b.score - a.score);

            resolve(scoredData);
          } catch (error) {
            console.error('Error during AI scoring:', error);
            reject(error);
          }
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Error reading or processing the CSV file:', error);
    return [];
  }
}; 