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
 * Calculates a comprehensive score for a user based on multiple factors
 * @param {Object} user - User data object
 * @returns {number} Calculated score (0-100)
 */
const calculateUserScore = (user) => {
  let score = 0;
  const maxScore = 100;

  // 1. LinkedIn Connections (0-30 points)
  const connections = parseInt(user.LinkedInConnections) || 0;
  if (connections > 0) {
    // Score based on connection tiers
    if (connections >= 1000) score += 30;
    else if (connections >= 500) score += 25;
    else if (connections >= 200) score += 20;
    else if (connections >= 100) score += 15;
    else if (connections >= 50) score += 10;
    else score += 5;
  }

  // 2. Experience Level (0-25 points)
  const experience = user.Experience || '';
  const experienceYears = extractYearsFromExperience(experience);
  if (experienceYears >= 5) score += 25;
  else if (experienceYears >= 3) score += 20;
  else if (experienceYears >= 2) score += 15;
  else if (experienceYears >= 1) score += 10;
  else score += 5;

  // 3. Company Prestige (0-20 points)
  const company = user.Company || '';
  const companyScore = calculateCompanyScore(company);
  score += companyScore;

  // 4. Skills Diversity (0-15 points)
  const skills = user.Skills || '';
  const skillCount = skills.split(',').length;
  if (skillCount >= 8) score += 15;
  else if (skillCount >= 6) score += 12;
  else if (skillCount >= 4) score += 9;
  else if (skillCount >= 2) score += 6;
  else score += 3;

  // 5. Education Level (0-10 points)
  const major = user.Major || '';
  const graduationYear = user.GraduationYear || '';
  const educationScore = calculateEducationScore(major, graduationYear);
  score += educationScore;

  return Math.min(score, maxScore);
};

/**
 * Extracts years of experience from experience string
 * @param {string} experience - Experience string
 * @returns {number} Years of experience
 */
const extractYearsFromExperience = (experience) => {
  if (!experience) return 0;
  
  const experienceStr = experience.toLowerCase();
  
  // Look for patterns like "5 years", "2+ years", "1 year", etc.
  const yearMatch = experienceStr.match(/(\d+)(?:\+)?\s*years?/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  // Look for patterns like "5+", "2+", etc.
  const plusMatch = experienceStr.match(/(\d+)\+/);
  if (plusMatch) {
    return parseInt(plusMatch[1]);
  }
  
  // Look for single year patterns
  const singleMatch = experienceStr.match(/(\d+)\s*year/);
  if (singleMatch) {
    return parseInt(singleMatch[1]);
  }
  
  return 0;
};

/**
 * Calculates company prestige score
 * @param {string} company - Company name
 * @returns {number} Company score (0-20)
 */
const calculateCompanyScore = (company) => {
  if (!company) return 0;
  
  const companyLower = company.toLowerCase();
  
  // Tier 1 Companies (20 points)
  const tier1Companies = [
    'google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook',
    'netflix', 'uber', 'airbnb', 'stripe', 'palantir', 'tesla',
    'spacex', 'openai', 'anthropic', 'nvidia', 'intel', 'amd'
  ];
  
  // Tier 2 Companies (15 points)
  const tier2Companies = [
    'linkedin', 'twitter', 'snapchat', 'pinterest', 'spotify',
    'salesforce', 'oracle', 'ibm', 'adobe', 'autodesk', 'intuit',
    'paypal', 'square', 'robinhood', 'coinbase', 'databricks',
    'snowflake', 'mongodb', 'elastic', 'atlassian', 'slack'
  ];
  
  // Tier 3 Companies (10 points)
  const tier3Companies = [
    'dropbox', 'box', 'zoom', 'twilio', 'sendgrid', 'stripe',
    'plaid', 'brex', 'notion', 'figma', 'canva', 'airtable',
    'zapier', 'hubspot', 'mailchimp', 'shopify', 'squarespace'
  ];
  
  // Tier 4 Companies (5 points)
  const tier4Companies = [
    'startup', 'inc', 'corp', 'llc', 'ltd', 'company', 'co'
  ];
  
  // Check for tier 1 companies
  for (const tier1 of tier1Companies) {
    if (companyLower.includes(tier1)) return 20;
  }
  
  // Check for tier 2 companies
  for (const tier2 of tier2Companies) {
    if (companyLower.includes(tier2)) return 15;
  }
  
  // Check for tier 3 companies
  for (const tier3 of tier3Companies) {
    if (companyLower.includes(tier3)) return 10;
  }
  
  // Check for tier 4 companies (startups/small companies)
  for (const tier4 of tier4Companies) {
    if (companyLower.includes(tier4)) return 5;
  }
  
  return 0;
};

/**
 * Calculates education score based on major and graduation year
 * @param {string} major - Major/degree
 * @param {string} graduationYear - Graduation year
 * @returns {number} Education score (0-10)
 */
const calculateEducationScore = (major, graduationYear) => {
  let score = 0;
  
  // Major relevance (0-6 points)
  const majorLower = major.toLowerCase();
  const relevantMajors = [
    'computer science', 'cs', 'software engineering', 'data science',
    'information technology', 'it', 'computer engineering', 'ce',
    'electrical engineering', 'ee', 'mathematics', 'math', 'statistics',
    'physics', 'engineering', 'technology'
  ];
  
  for (const relevantMajor of relevantMajors) {
    if (majorLower.includes(relevantMajor)) {
      score += 6;
      break;
    }
  }
  
  // Graduation year relevance (0-4 points)
  const currentYear = new Date().getFullYear();
  const gradYear = parseInt(graduationYear);
  
  if (gradYear && !isNaN(gradYear)) {
    const yearsSinceGraduation = currentYear - gradYear;
    
    // Recent graduates (0-2 years) get bonus points
    if (yearsSinceGraduation <= 2) score += 4;
    else if (yearsSinceGraduation <= 5) score += 3;
    else if (yearsSinceGraduation <= 10) score += 2;
    else score += 1;
  }
  
  return score;
};

/**
 * Ranks users by their calculated scores
 * @param {Array} users - Array of user objects
 * @returns {Array} Ranked users with scores and rankings
 */
const rankUsers = (users) => {
  // Calculate scores for all users
  const usersWithScores = users.map(user => {
    const calculatedScore = calculateUserScore(user);
    
    // Extract profile image from experience data
    let profileImage = null;
    if (user.Experience) {
      try {
        const experienceData = JSON.parse(user.Experience);
        if (Array.isArray(experienceData) && experienceData.length > 0) {
          // Use the first experience entry's company logo as profile image
          profileImage = experienceData[0].company_logo || null;
        }
      } catch (error) {
        console.log(`Failed to parse experience data for ${user.Name}:`, error);
      }
    }
    
    return {
      ...user,
      calculatedScore,
      score: calculatedScore, // Add score property (same as calculatedScore)
      image: profileImage, // Add image property
      scoreBreakdown: {
        connections: calculateConnectionScore(user.LinkedInConnections),
        experience: calculateExperienceScore(user.Experience),
        company: calculateCompanyScore(user.Company),
        skills: calculateSkillsScore(user.Skills),
        education: calculateEducationScore(user.Major, user.GraduationYear)
      }
    };
  });
  
  // Sort by score (highest to lowest)
  usersWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);
  
  // Add ranking with tie handling
  let currentRank = 1;
  let currentScore = null;
  let tieCount = 0;
  
  // Limit to top 20 people
  const maxIterations = Math.min(20, usersWithScores.length);
  
  for (let i = 0; i < maxIterations; i++) {
    const user = usersWithScores[i];
    
    if (currentScore !== null && user.calculatedScore === currentScore) {
      // This is a tie - use the same rank
      user.rank = currentRank;
      user.isTie = true;
      tieCount++;
    } else {
      // New rank - account for ties
      currentRank = currentRank + tieCount + 1;
      user.rank = currentRank;
      user.isTie = false;
      tieCount = 0;
    }
    
    currentScore = user.calculatedScore;
    user.rankBadge = getRankBadge(user.rank, user.isTie);
  }
  
  // Return only the top 20 users
  return usersWithScores.slice(0, maxIterations);
};

/**
 * Helper function to get rank badge with tie indicator
 * @param {number} rank - Rank number
 * @param {boolean} isTie - Whether this is a tie
 * @returns {string} Rank badge with tie indicator
 */
const getRankBadge = (rank, isTie = false) => {
  let badge = '';
  
  if (rank === 1) badge = '🥇';
  else if (rank === 2) badge = '🥈';
  else if (rank === 3) badge = '🥉';
  else badge = `#${rank}`;
  
  // Add tie indicator
  if (isTie) {
    badge += ' TIE';
  }
  
  return badge;
};

/**
 * Helper functions for score breakdown
 */
const calculateConnectionScore = (connections) => {
  const conn = parseInt(connections) || 0;
  if (conn >= 1000) return 30;
  if (conn >= 500) return 25;
  if (conn >= 200) return 20;
  if (conn >= 100) return 15;
  if (conn >= 50) return 10;
  return conn > 0 ? 5 : 0;
};

const calculateExperienceScore = (experience) => {
  const years = extractYearsFromExperience(experience);
  if (years >= 5) return 25;
  if (years >= 3) return 20;
  if (years >= 2) return 15;
  if (years >= 1) return 10;
  return 5;
};

const calculateSkillsScore = (skills) => {
  if (!skills) return 0;
  const skillCount = skills.split(',').length;
  if (skillCount >= 8) return 15;
  if (skillCount >= 6) return 12;
  if (skillCount >= 4) return 9;
  if (skillCount >= 2) return 6;
  return 3;
};

/**
 * Removes duplicates based on name matching
 */
const removeDuplicates = (data) => {
  console.log(`🔄 Starting duplicate removal...`);
  console.log(`📊 Original data count: ${data.length}`);
  
  const uniqueData = [];
  const seenNames = new Set();
  const duplicates = [];
  
  data.forEach((user, index) => {
    const name = user.Name || user.name || '';
    const normalizedName = name.toLowerCase().trim();
    
    if (!normalizedName) {
      console.log(`⚠️ Skipping user at index ${index} - no name found`);
      return;
    }
    
    if (seenNames.has(normalizedName)) {
      duplicates.push({
        index,
        name: normalizedName,
        user
      });
      console.log(`❌ Duplicate found: "${name}" at index ${index}`);
    } else {
      seenNames.add(normalizedName);
      uniqueData.push(user);
    }
  });
  
  console.log(`✅ Duplicate removal complete:`);
  console.log(`   - Original: ${data.length} records`);
  console.log(`   - Unique: ${uniqueData.length} records`);
  console.log(`   - Removed: ${duplicates.length} duplicates`);
  
  if (duplicates.length > 0) {
    console.log(`📋 Duplicates removed:`);
    duplicates.forEach(dup => {
      console.log(`   - "${dup.name}" (index ${dup.index})`);
    });
  }
  
  return uniqueData;
};

/**
 * Reads and processes the data from berkeleyData.json.
 *
 * @returns {Promise<Array>} A promise that resolves with an array of cleaned, scored, and ranked data objects.
 */
export const getCleanedData = async () => {
  try {
    console.log('Loading data from berkeleyData.json...');
    
    // Import the real data from JSON
    const realData = await import('./berkeleyData.json');
    
    if (!realData || !realData.default || realData.default.length === 0) {
      throw new Error('No data found in berkeleyData.json');
    }
    
    console.log(`Loaded ${realData.default.length} records from berkeleyData.json`);
    
    // Remove duplicates based on name
    const uniqueData = removeDuplicates(realData.default);
    
    // Rank and score the data to add image and score properties
    const rankedData = rankUsers(uniqueData);
    
    console.log('Data loaded, deduplicated, and ranked successfully!');
    return rankedData;
    
  } catch (error) {
    console.error('Error reading berkeleyData.json:', error);
    throw new Error('Failed to load data from berkeleyData.json. Please ensure the file exists and contains valid data.');
  }
};

/**
 * Get top performers (top N users)
 * @param {number} count - Number of top performers to return
 * @returns {Promise<Array>} Top performers
 */
export const getTopPerformers = async (count = 10) => {
  const allData = await getCleanedData();
  return allData.slice(0, count);
};

/**
 * Get users by score range
 * @param {number} minScore - Minimum score
 * @param {number} maxScore - Maximum score
 * @returns {Promise<Array>} Users in score range
 */
export const getUsersByScoreRange = async (minScore = 0, maxScore = 100) => {
  const allData = await getCleanedData();
  return allData.filter(user => 
    user.calculatedScore >= minScore && user.calculatedScore <= maxScore
  );
}; 