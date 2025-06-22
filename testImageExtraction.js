// Test script to verify image extraction from LinkedIn data
import * as XLSX from 'xlsx';
import fs from 'fs';

// Mock the calculateUserScore function and other dependencies
const calculateUserScore = (user) => {
  // Simple mock implementation
  return Math.floor(Math.random() * 100);
};

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
  return 10; // Mock implementation
};

const calculateCompanyScore = (company) => {
  return 10; // Mock implementation
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

const calculateEducationScore = (major, graduationYear) => {
  return 5; // Mock implementation
};

const getRankBadge = (rank, isTie = false) => {
  let badge = '';
  if (rank === 1) badge = '🥇';
  else if (rank === 2) badge = '🥈';
  else if (rank === 3) badge = '🥉';
  else badge = `#${rank}`;
  if (isTie) badge += ' TIE';
  return badge;
};

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

const testImageExtraction = async () => {
  try {
    console.log('🧪 Testing image extraction from LinkedIn data...');
    
    // Read the JSON data directly
    const jsonData = fs.readFileSync('./berkeleyData.json', 'utf8');
    const realData = JSON.parse(jsonData);
    
    if (!realData || realData.length === 0) {
      throw new Error('No data found in berkeleyData.json');
    }
    
    console.log(`📊 Loaded ${realData.length} records from berkeleyData.json`);
    
    // Test the ranking function
    const rankedData = rankUsers(realData);
    
    console.log(`📊 Processed ${rankedData.length} ranked records`);
    
    // Check the first few records for image properties
    const sampleRecords = rankedData.slice(0, 5);
    
    sampleRecords.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}: ${user.Name}`);
      console.log(`   Score: ${user.score}`);
      console.log(`   Image: ${user.image ? '✅ Found' : '❌ Not found'}`);
      if (user.image) {
        console.log(`   Image URL: ${user.image.substring(0, 50)}...`);
      }
      console.log(`   Rank: ${user.rank}`);
    });
    
    // Count how many users have images
    const usersWithImages = rankedData.filter(user => user.image);
    console.log(`\n📈 Summary:`);
    console.log(`   Total users: ${rankedData.length}`);
    console.log(`   Users with images: ${usersWithImages.length}`);
    console.log(`   Image coverage: ${((usersWithImages.length / rankedData.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testImageExtraction(); 