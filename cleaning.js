<<<<<<< HEAD
import * as XLSX from 'xlsx';
import { Asset } from 'expo-asset';

// --- Configuration ---
// The name of the column you want to use to identify duplicates.
// For example, if you have an 'Email' or 'ID' column, use that.
const DUPLICATE_CHECK_COLUMN = 'Name'; 
=======
import Papa from 'papaparse';
import { Asset } from 'expo-asset';
import { getAIRankedScore } from './CSRanking';

// --- Configuration ---
// Set these values to control the filtering and ranking process.
const FILTER_COLUMN = 'Major'; // The column to check for the keyword (e.g., 'Major', 'Skills').
const FILTER_KEYWORD = 'Data Science'; // The keyword to identify the students you want to rank.
const DUPLICATE_CHECK_COLUMN = 'Name'; // The column to use for removing duplicates.
>>>>>>> 190cc413d60e257ea0ede03cb87c0715b6a1135c

// The name of the column to sort the data by.
const SORT_BY_COLUMN = 'Name'; 

// Sort order: 'asc' for ascending, 'desc' for descending.
const SORT_ORDER = 'asc';

/**
<<<<<<< HEAD
 * Reads and processes the XLSX data from the specified file path.
 *
 * @returns {Promise<Array>} A promise that resolves with an array of cleaned and sorted data objects.
 */
export const getCleanedData = async () => {
  try {
    // Try to load the XLSX file
    console.log('Attempting to load XLSX file...');
    
    // In React Native, we load the asset first
    const asset = Asset.fromModule(require('./ALLCSDATA.xlsx'));
    await asset.downloadAsync(); // Optional, but ensures it's available

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();

    // Parse the XLSX file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract headers and data
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // Convert to array of objects
    const results = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    console.log(`Loaded ${results.length} rows from XLSX file`);

    // --- 1. Remove Duplicates ---
    const uniqueData = [];
    const seen = new Set();
    
    results.forEach(row => {
      const identifier = row[DUPLICATE_CHECK_COLUMN];
      if (identifier && !seen.has(identifier)) {
        seen.add(identifier);
        uniqueData.push(row);
      }
    });

    console.log(`Removed duplicates: ${results.length} -> ${uniqueData.length} unique entries`);

    // --- 2. Sort Data ---
    uniqueData.sort((a, b) => {
      const valA = a[SORT_BY_COLUMN] || '';
      const valB = b[SORT_BY_COLUMN] || '';

      if (valA < valB) {
        return SORT_ORDER === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return SORT_ORDER === 'asc' ? 1 : -1;
      }
      return 0;
    });

    console.log(`Data sorted by ${SORT_BY_COLUMN} in ${SORT_ORDER} order`);
    console.log('Data processed successfully!');
    return uniqueData;
    
  } catch (error) {
    console.error('Error reading the XLSX file:', error);
    console.log('Falling back to mock data...');
    
    // Return mock data as fallback
    const mockData = [
      { Name: 'John Doe', Title: 'Software Engineer', Company: 'Tech Corp' },
      { Name: 'Jane Smith', Title: 'Product Manager', Company: 'Startup Inc' },
      { Name: 'Mike Johnson', Title: 'Data Scientist', Company: 'AI Labs' },
      { Name: 'Sarah Wilson', Title: 'UX Designer', Company: 'Design Studio' },
      { Name: 'David Brown', Title: 'Marketing Manager', Company: 'Marketing Co' },
    ];
    
    // Apply the same sorting to mock data
    mockData.sort((a, b) => {
      const valA = a[SORT_BY_COLUMN] || '';
      const valB = b[SORT_BY_COLUMN] || '';

      if (valA < valB) {
        return SORT_ORDER === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return SORT_ORDER === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return mockData;
=======
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
>>>>>>> 190cc413d60e257ea0ede03cb87c0715b6a1135c
  }
}; 