const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Import the ranking functions from cleaning.js
const {
  calculateUserScore,
  extractYearsFromExperience,
  calculateCompanyScore,
  calculateEducationScore,
  rankUsers,
  getRankBadge
} = require('./cleaning.js');

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
 */
const extractYearsFromExperience = (experience) => {
  if (!experience) return 0;
  
  const experienceStr = experience.toLowerCase();
  
  const yearMatch = experienceStr.match(/(\d+)(?:\+)?\s*years?/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  const plusMatch = experienceStr.match(/(\d+)\+/);
  if (plusMatch) {
    return parseInt(plusMatch[1]);
  }
  
  const singleMatch = experienceStr.match(/(\d+)\s*year/);
  if (singleMatch) {
    return parseInt(singleMatch[1]);
  }
  
  return 0;
};

/**
 * Calculates company prestige score
 */
const calculateCompanyScore = (company) => {
  if (!company) return 0;
  
  const companyLower = company.toLowerCase();
  
  const tier1Companies = [
    'google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook',
    'netflix', 'uber', 'airbnb', 'stripe', 'palantir', 'tesla',
    'spacex', 'openai', 'anthropic', 'nvidia', 'intel', 'amd'
  ];
  
  const tier2Companies = [
    'linkedin', 'twitter', 'snapchat', 'pinterest', 'spotify',
    'salesforce', 'oracle', 'ibm', 'adobe', 'autodesk', 'intuit',
    'paypal', 'square', 'robinhood', 'coinbase', 'databricks',
    'snowflake', 'mongodb', 'elastic', 'atlassian', 'slack'
  ];
  
  const tier3Companies = [
    'dropbox', 'box', 'zoom', 'twilio', 'sendgrid', 'stripe',
    'plaid', 'brex', 'notion', 'figma', 'canva', 'airtable',
    'zapier', 'hubspot', 'mailchimp', 'shopify', 'squarespace'
  ];
  
  const tier4Companies = [
    'startup', 'inc', 'corp', 'llc', 'ltd', 'company', 'co'
  ];
  
  for (const tier1 of tier1Companies) {
    if (companyLower.includes(tier1)) return 20;
  }
  
  for (const tier2 of tier2Companies) {
    if (companyLower.includes(tier2)) return 15;
  }
  
  for (const tier3 of tier3Companies) {
    if (companyLower.includes(tier3)) return 10;
  }
  
  for (const tier4 of tier4Companies) {
    if (companyLower.includes(tier4)) return 5;
  }
  
  return 0;
};

/**
 * Calculates education score based on major and graduation year
 */
const calculateEducationScore = (major, graduationYear) => {
  let score = 0;
  
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
  
  const currentYear = new Date().getFullYear();
  const gradYear = parseInt(graduationYear);
  
  if (gradYear && !isNaN(gradYear)) {
    const yearsSinceGraduation = currentYear - gradYear;
    
    if (yearsSinceGraduation <= 2) score += 4;
    else if (yearsSinceGraduation <= 5) score += 3;
    else if (yearsSinceGraduation <= 10) score += 2;
    else score += 1;
  }
  
  return score;
};

/**
 * Ranks users by their calculated scores
 */
const rankUsers = (users) => {
  const usersWithScores = users.map(user => ({
    ...user,
    calculatedScore: calculateUserScore(user),
    scoreBreakdown: {
      connections: calculateConnectionScore(user.LinkedInConnections),
      experience: calculateExperienceScore(user.Experience),
      company: calculateCompanyScore(user.Company),
      skills: calculateSkillsScore(user.Skills),
      education: calculateEducationScore(user.Major, user.GraduationYear)
    }
  }));
  
  usersWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);
  
  let currentRank = 1;
  let currentScore = null;
  let tieCount = 0;
  
  usersWithScores.forEach((user, index) => {
    if (currentScore !== null && user.calculatedScore === currentScore) {
      user.rank = currentRank;
      user.isTie = true;
      tieCount++;
    } else {
      currentRank = currentRank + tieCount + 1;
      user.rank = currentRank;
      user.isTie = false;
      tieCount = 0;
    }
    
    currentScore = user.calculatedScore;
    user.rankBadge = getRankBadge(user.rank, user.isTie);
  });
  
  return usersWithScores;
};

/**
 * Helper function to get rank badge with tie indicator
 */
const getRankBadge = (rank, isTie = false) => {
  let badge = '';
  
  if (rank === 1) badge = '🥇';
  else if (rank === 2) badge = '🥈';
  else if (rank === 3) badge = '🥉';
  else badge = `#${rank}`;
  
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
 * Main function to convert XLSX to ranked JSON
 */
const convertAndRankData = async () => {
  try {
    console.log('🔄 Starting XLSX to ranked JSON conversion...');
    
    // Read the XLSX file
    const xlsxPath = path.join(__dirname, 'ALLCSDATA.xlsx');
    
    if (!fs.existsSync(xlsxPath)) {
      console.error('❌ ALLCSDATA.xlsx not found in the current directory');
      console.log('📋 Please make sure ALLCSDATA.xlsx is in the project root');
      return;
    }
    
    console.log('📖 Reading XLSX file...');
    const workbook = XLSX.readFile(xlsxPath);
    
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

    console.log(`✅ Loaded ${results.length} rows from XLSX file`);

    // Remove duplicates based on Name
    const uniqueData = [];
    const seen = new Set();
    
    results.forEach(row => {
      const identifier = row.Name;
      if (identifier && !seen.has(identifier)) {
        seen.add(identifier);
        uniqueData.push(row);
      }
    });

    console.log(`🔄 Removed duplicates: ${results.length} -> ${uniqueData.length} unique entries`);

    // Apply ranking algorithm
    console.log('🏆 Applying ranking algorithm...');
    const rankedData = rankUsers(uniqueData);
    
    console.log('📊 Top 10 ranked users:');
    rankedData.slice(0, 10).forEach((user, index) => {
      const tieIndicator = user.isTie ? ' (TIE)' : '';
      console.log(`${user.rankBadge} ${user.Name}: ${user.calculatedScore}/100 points${tieIndicator}`);
    });

    // Add profile image URLs
    const enhancedData = rankedData.map((user, index) => ({
      ...user,
      ProfileImageURL: user.ProfileImageURL || `https://picsum.photos/200/200?random=${index + 1}`
    }));

    // Write to JSON file
    const outputPath = path.join(__dirname, 'berkeleyData.json');
    fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2));
    
    console.log(`✅ Ranked data saved to: ${outputPath}`);
    console.log(`📊 Total users ranked: ${enhancedData.length}`);
    console.log(`🏆 Highest score: ${enhancedData[0]?.calculatedScore}/100`);
    console.log(`📈 Average score: ${Math.round(enhancedData.reduce((sum, user) => sum + user.calculatedScore, 0) / enhancedData.length)}/100`);
    
  } catch (error) {
    console.error('❌ Error converting data:', error);
    
    // Fallback to sample data if conversion fails
    console.log('🔄 Falling back to sample ranked data...');
    
    const sampleData = [
      { 
        Name: 'John Doe', 
        Title: 'Software Engineer', 
        Company: 'Google',
        Major: 'Computer Science',
        GraduationYear: '2022',
        LinkedInConnections: 850,
        Experience: '3 years',
        Skills: 'Python, JavaScript, React, Node.js, AWS, Docker',
        ProfileImageURL: 'https://picsum.photos/200/200?random=1'
      },
      { 
        Name: 'Jane Smith', 
        Title: 'Product Manager', 
        Company: 'Meta',
        Major: 'Business Administration',
        GraduationYear: '2021',
        LinkedInConnections: 1200,
        Experience: '4 years',
        Skills: 'Product Strategy, Analytics, Leadership, SQL, Python',
        ProfileImageURL: 'https://picsum.photos/200/200?random=2'
      },
      { 
        Name: 'Mike Johnson', 
        Title: 'Data Scientist', 
        Company: 'Netflix',
        Major: 'Statistics',
        GraduationYear: '2023',
        LinkedInConnections: 450,
        Experience: '2 years',
        Skills: 'Python, R, Machine Learning, SQL, TensorFlow',
        ProfileImageURL: 'https://picsum.photos/200/200?random=3'
      },
      { 
        Name: 'Sarah Wilson', 
        Title: 'UX Designer', 
        Company: 'Apple',
        Major: 'Design',
        GraduationYear: '2020',
        LinkedInConnections: 650,
        Experience: '5 years',
        Skills: 'Figma, User Research, Prototyping, Sketch, InVision',
        ProfileImageURL: 'https://picsum.photos/200/200?random=4'
      },
      { 
        Name: 'David Brown', 
        Title: 'Marketing Manager', 
        Company: 'Startup Inc',
        Major: 'Marketing',
        GraduationYear: '2019',
        LinkedInConnections: 300,
        Experience: '6 years',
        Skills: 'Digital Marketing, Analytics, Strategy, Google Ads',
        ProfileImageURL: 'https://picsum.photos/200/200?random=5'
      },
    ];
    
    const rankedSampleData = rankUsers(sampleData);
    const outputPath = path.join(__dirname, 'berkeleyData.json');
    fs.writeFileSync(outputPath, JSON.stringify(rankedSampleData, null, 2));
    
    console.log(`✅ Sample ranked data saved to: ${outputPath}`);
  }
};

// Run the conversion
convertAndRankData(); 