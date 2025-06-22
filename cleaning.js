import Papa from 'papaparse';
import { Asset } from 'expo-asset';
import { getAIRankedScore } from './CSRanking';

// --- Configuration ---
// The name of the column you want to use to identify duplicates.
// For example, if you have an 'Email' or 'ID' column, use that.
const DUPLICATE_CHECK_COLUMN = 'Name'; 

// The name of the column to sort the data by.
const SORT_BY_COLUMN = 'Name'; 

// Sort order: 'asc' for ascending, 'desc' for descending.
const SORT_ORDER = 'asc';

/**
 * Processes the CSV file, gets an AI-generated score for each unique user,
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
            // --- 1. Remove Duplicates (based on the 'Name' column) ---
            const uniqueData = [];
            const seen = new Set();
            results.data.forEach(row => {
              const identifier = row['Name'];
              if (identifier && !seen.has(identifier)) {
                seen.add(identifier);
                uniqueData.push(row);
              }
            });

            // --- 2. Get AI Score for each user ---
            console.log(`Getting AI scores for ${uniqueData.length} users...`);
            const scoredDataPromises = uniqueData.map(user => {
                // We construct a 'profile' object from the CSV row for the AI.
                // NOTE: This assumes your CSV has 'Experience', 'Education', and 'Skills' columns.
                // If your columns are named differently, you'll need to update them here.
                const profile = {
                    experience: [{ text: user.Experience || '' }],
                    education: [{ text: user.Education || '' }],
                    skills: user.Skills ? user.Skills.split(',').map(s => s.trim()) : []
                };
                
                return getAIRankedScore(profile).then(score => ({
                    ...user,
                    score: score, // Add the new AI score to the user object
                }));
            });

            const scoredData = await Promise.all(scoredDataPromises);
            console.log('All AI scores received.');

            // --- 3. Sort by Score (Best to Worst) ---
            scoredData.sort((a, b) => b.score - a.score);

            resolve(scoredData);
          } catch (error) {
            console.error('Error during AI scoring:', error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error reading or processing the CSV file:', error);
    return []; // Return empty array on failure
  }
}; 