// Import the JSON data directly
import berkeleyData from './berkeleyData.json';

// --- Configuration ---
const DUPLICATE_CHECK_COLUMN = 'Name'; 
const SORT_BY_COLUMN = 'Name'; 
const SORT_ORDER = 'asc';

/**
 * Gets cleaned and sorted data from the JSON file
 * @returns {Promise<Array>} A promise that resolves with an array of cleaned and sorted data objects
 */
export const getCleanedData = async () => {
  try {
    console.log('Loading data from JSON file...');
    
    // Use the imported JSON data
    const results = berkeleyData;
    
    console.log(`Loaded ${results.length} rows from JSON file`);

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
    console.error('Error reading the JSON file:', error);
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

/**
 * Gets data with custom sorting
 * @param {string} sortBy - Column to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Promise<Array>} Sorted data
 */
export const getSortedData = async (sortBy = 'Name', sortOrder = 'asc') => {
  try {
    const data = await getCleanedData();
    
    return data.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  } catch (error) {
    console.error('Error sorting data:', error);
    return [];
  }
};

/**
 * Filters data by a specific field and value
 * @param {string} field - Field to filter by
 * @param {string} value - Value to filter for
 * @returns {Promise<Array>} Filtered data
 */
export const getFilteredData = async (field, value) => {
  try {
    const data = await getCleanedData();
    
    return data.filter(item => {
      const fieldValue = item[field];
      if (!fieldValue) return false;
      
      return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  } catch (error) {
    console.error('Error filtering data:', error);
    return [];
  }
};

/**
 * Gets statistics about the data
 * @returns {Promise<Object>} Statistics object
 */
export const getDataStats = async () => {
  try {
    const data = await getCleanedData();
    
    const stats = {
      totalEntries: data.length,
      uniqueCompanies: new Set(data.map(item => item.Company)).size,
      uniqueMajors: new Set(data.map(item => item.Major)).size,
      averageConnections: data.reduce((sum, item) => sum + (parseInt(item.LinkedInConnections) || 0), 0) / data.length,
      topCompanies: getTopValues(data, 'Company', 5),
      topMajors: getTopValues(data, 'Major', 5),
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting data stats:', error);
    return {};
  }
};

/**
 * Helper function to get top values by frequency
 */
const getTopValues = (data, field, limit) => {
  const counts = {};
  data.forEach(item => {
    const value = item[field];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}; 