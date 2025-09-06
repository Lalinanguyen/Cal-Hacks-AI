// Real data from Excel file - using real data from berkeley_students.json
import realBerkeleyData from './berkeley_students.json';

// Load the raw data (using real data from JSON)
const loadRawData = () => {
  console.log('Loading real Berkeley student data from JSON...');
  return realBerkeleyData;
};

// Clean and process the data
const cleanData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) {
    console.log( Invalid raw data format');
    return [];
  }

  console.log(`Processing ${rawData.length} raw records...`);
  
  const cleanedData = rawData
    .filter(item => item && item.Name) // Remove items without names
    .map(item => {
      // Extract company logos from Experience field (7th column)
      let companyLogos = [];
      let experienceData = [];
      
      if (item.Experience) {
        try {
          const parsedExperience = JSON.parse(item.Experience);
          if (Array.isArray(parsedExperience)) {
            experienceData = parsedExperience;
            // Extract all company logos
            companyLogos = parsedExperience
              .map(exp => exp.company_logo)
              .filter(logo => logo && logo.trim() !== '');
          }
        } catch (e) {
          console.log(`Could not parse Experience JSON for ${item.Name}:`, e.message);
        }
      }

      // Use first company logo as profile image if no ProfileImageURL
      const profileImage = item.ProfileImageURL || (companyLogos.length > 0 ? companyLogos[0] : null);

      return {
        Name: item.Name || item.name || 'Unknown',
        Title: item.Title || item.title || item.Headline || item.headline || 'Student',
        Company: item.Company || item.company || item.Major || item.major || 'UC Berkeley',
        Major: item.Major || item.major || '',
        LinkedInConnections: parseInt(item.LinkedInConnections || item.Connections || item.connections || 0) || 0,
        Skills: item.Skills || item.skills || '',
        Location: item.Location || item.location || '',
        Experience: item.Experience || item.experience || '',
        Education: item.Education || item.education || '',
        GraduationYear: item.GraduationYear || item.graduationYear || '',
        ProfileImageURL: profileImage, // Use ProfileImageURL or first company logo
        companyLogos: companyLogos, // Store all company logos for profile screens
        experienceData: experienceData, // Store parsed experience data
        Score: 0, // Will be calculated in rankUsers
        Rank: 0 // Will be assigned in rankUsers
      };
    })
    .filter(item => item.LinkedInConnections > 0); // Only include people with connections

  console.log(`Cleaned ${cleanedData.length} records`);
  return cleanedData;
};

// Rank users by their LinkedIn connections and assign scores
const rankUsers = (cleanedData) => {
  if (!cleanedData || cleanedData.length === 0) {
    console.log('No cleaned data to rank');
    return [];
  }

  console.log(`Ranking ${cleanedData.length} users...`);

  // Calculate scores based on LinkedIn connections
  const scoredData = cleanedData.map(user => {
    const connections = user.LinkedInConnections || 0;
    const calculatedScore = Math.round(connections / 10); // Score = connections/10
    
    return {
      ...user,
      Score: calculatedScore,
      score: calculatedScore // Keep both for compatibility
    };
  });

  // Sort by score (highest first)
  const sortedData = scoredData.sort((a, b) => (b.Score || 0) - (a.Score || 0));

  // Assign ranks and limit to top 20
  const rankedData = [];
  for (let i = 0; i < Math.min(20, sortedData.length); i++) {
    rankedData.push({
      ...sortedData[i],
      Rank: i + 1,
      rank: i + 1 // Keep both for compatibility
    });
  }

  console.log(`Ranked ${rankedData.length} top performers`);
  return rankedData;
};

// Main function to get cleaned and ranked data
const getCleanedData = async () => {
  try {
    console.log('Starting data cleaning process...');
    
    const rawData = loadRawData();
    if (!rawData) {
      throw new Error('Failed to load raw data');
    }

    const cleanedData = cleanData(rawData);
    if (cleanedData.length === 0) {
      throw new Error('No valid data after cleaning');
    }

    const rankedData = rankUsers(cleanedData);
    
    console.log('Data cleaning and ranking complete');
    return rankedData;
  } catch (error) {
    console.error('Error in getCleanedData:', error);
    throw error;
  }
};

// Get top performers (for Claude analysis)
const getTopPerformers = async (limit = 20) => {
  try {
    const allData = await getCleanedData();
    return allData.slice(0, limit);
  } catch (error) {
    console.error('Error getting top performers:', error);
    return [];
  }
};

module.exports = {
  getCleanedData,
  getTopPerformers,
  cleanData,
  rankUsers
}; 
