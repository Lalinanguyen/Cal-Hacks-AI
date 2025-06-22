import * as XLSX from 'xlsx';
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
  }
}; 