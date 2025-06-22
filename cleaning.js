import Papa from 'papaparse';
import { Asset } from 'expo-asset';

// --- Configuration ---
// The name of the column you want to use to identify duplicates.
// For example, if you have an 'Email' or 'ID' column, use that.
const DUPLICATE_CHECK_COLUMN = 'Name'; 

// The name of the column to sort the data by.
const SORT_BY_COLUMN = 'Name'; 

// Sort order: 'asc' for ascending, 'desc' for descending.
const SORT_ORDER = 'asc';

/**
 * Reads and processes the CSV data from the specified file path.
 *
 * @returns {Promise<Array>} A promise that resolves with an array of cleaned and sorted data objects.
 */
export const getCleanedData = async () => {
  try {
    // In React Native, we load the asset first
    const asset = Asset.fromModule(require('./assets/allcsdata.csv'));
    await asset.downloadAsync(); // Optional, but ensures it's available

    const response = await fetch(asset.uri);
    const csvString = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true,
        complete: (results) => {
          // --- 1. Remove Duplicates ---
          const uniqueData = [];
          const seen = new Set();
          
          results.data.forEach(row => {
            const identifier = row[DUPLICATE_CHECK_COLUMN];
            if (!seen.has(identifier)) {
              seen.add(identifier);
              uniqueData.push(row);
            }
          });

          // --- 2. Sort Data ---
          uniqueData.sort((a, b) => {
            const valA = a[SORT_BY_COLUMN];
            const valB = b[SORT_BY_COLUMN];

            if (valA < valB) {
              return SORT_ORDER === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
              return SORT_ORDER === 'asc' ? 1 : -1;
            }
            return 0;
          });

          console.log('Data processed successfully!');
          resolve(uniqueData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error reading the CSV file:', error);
    // Returning an empty array in case of an error.
    return [];
  }
}; 