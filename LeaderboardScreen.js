import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getCleanedData, getTopPerformers } from './cleaning.js';
import { storeUserAnalysis, getClaudeResponsesByType } from './claudeStorageService';
import { getClaudeRanking, getClaudeIndustryInsights } from './claudeRankingService';
import { getStoredLinkedInProfile } from './linkedinService';

const LeaderboardItem = ({ item, index, isFirst, useClaudeRanking, navigation, totalStudents }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const getFallbackColor = (name) => {
    if (!name) return '#FF6B6B';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getRankBadge = (rank) => {
    if (!rank) return '#1';
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getDisplayRank = () => {
    if (useClaudeRanking && item.ClaudeRank) {
      return item.ClaudeRank;
    }
    
    // Check if this is the user's profile (John Doe or User)
    const isUserProfile = item.Name === 'John Doe' || item.Name === 'User';
    
    if (isUserProfile && totalStudents) {
      // Show user's rank out of total students in CSV
      const userRank = item.Rank || item.rank || 1;
      return `${userRank}/${totalStudents}`;
    }
    
    // For other students, show their rank among top 20
    return item.Rank || item.rank || index + 1;
  };

  // Ensure all text values are strings
  const safeName = String(item.Name || 'Unknown');
  const safeTitle = String(item.Title || 'Student');
  const safeCompany = String(item.Company || item.Major || 'UC Berkeley');
  const safeConnections = item.LinkedInConnections ? String(item.LinkedInConnections) : null;
  const safeSkills = item.Skills ? String(item.Skills) : null;
  const safeClaudeReasoning = item.ClaudeReasoning ? String(item.ClaudeReasoning) : null;
  const safeClaudeStrengths = Array.isArray(item.ClaudeStrengths) ? item.ClaudeStrengths : [];

  // Get the best available image URL
  const getImageUrl = () => {
    // Only use actual profile images, no fallbacks
    if (item.ProfileImageURL) {
      return item.ProfileImageURL;
    }
    if (item.image) {
      return item.image;
    }
    if (item.profilePicture) {
      return item.profilePicture;
    }
    // Return null if no image available - will show placeholder
    return null;
  };
  
  const imageUrl = getImageUrl();

  const handlePress = () => {
    // Check if this is the user's profile (you can customize this logic)
    const isUserProfile = item.Name === 'John Doe' || item.Name === 'User'; // Add your logic here
    
    if (isUserProfile) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('OtherProfileScreen', { profile: item });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{getDisplayRank()}</Text>
      </View>
      
      <View style={styles.profileContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.profileImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.profileImage, { backgroundColor: getFallbackColor(safeName) }]}>
            <Text style={styles.profileInitial}>
              {safeName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{safeName}</Text>
        <Text style={styles.titleText}>{safeTitle}</Text>
        <Text style={styles.companyText}>{safeCompany}</Text>
        {safeConnections && (
          <Text style={styles.connectionsText}>📊 {safeConnections} connections</Text>
        )}
        {safeSkills && (
          <Text style={styles.skillsText} numberOfLines={1}>
            💼 {safeSkills.split(',').slice(0, 2).join(', ')}
          </Text>
        )}
        {useClaudeRanking && safeClaudeReasoning && (
          <Text style={styles.claudeReasoningText} numberOfLines={2}>
            🤖 {safeClaudeReasoning}
          </Text>
        )}
        {useClaudeRanking && safeClaudeStrengths.length > 0 && (
          <Text style={styles.claudeStrengthsText} numberOfLines={1}>
            ✅ {safeClaudeStrengths.slice(0, 2).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Utility: Convert profile data to leaderboard format
const profileToLeaderboardFormat = (profile) => {
  if (!profile) return null;
  return {
    Name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User',
    Title: profile.title || profile.headline || '',
    Company: profile.company || '',
    Major: profile.major || '',
    LinkedInConnections: profile.connections || profile.LinkedInConnections || 0,
    Skills: Array.isArray(profile.skills) ? profile.skills.join(',') : (profile.skills || ''),
    ProfileImageURL: profile.profilePicture || profile.ProfileImageURL || profile.image || '',
    image: profile.profilePicture || profile.ProfileImageURL || profile.image || '',
    Score: profile.score || 0,
    Rank: profile.rank || 0,
    Location: profile.location || '',
    Experience: profile.experience || '',
    Education: profile.education || '',
    GraduationYear: profile.graduationYear || profile.GraduationYear || '',
  };
};

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [claudeRankedData, setClaudeRankedData] = useState([]); // New state for Claude-ranked data
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState(''); // 'real', 'mock', or 'error'
  const [claudeRanking, setClaudeRanking] = useState(null);
  const [claudeInsights, setClaudeInsights] = useState(null);
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [useClaudeRanking, setUseClaudeRanking] = useState(false);
  const [analysisSource, setAnalysisSource] = useState('none'); // 'fresh', 'stored', or 'none'
  const [totalStudents, setTotalStudents] = useState(0); // Total number of students in CSV

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading Berkeley student data...');
      
      // Use getCleanedData to get properly cleaned, scored, and ranked data
      const cleanedData = await getCleanedData();
      
      // Fetch the user's profile (from storage or mock)
      let userProfile = null;
      try {
        const storedResult = await getStoredLinkedInProfile();
        if (storedResult.success && storedResult.profile) {
          userProfile = storedResult.profile;
        } else {
          // Fallback to mock profile if no stored profile
          userProfile = {
            Name: 'John Doe',
            Title: 'Software Engineer at Berkeley',
            Company: 'Berkeley Startup',
            Major: 'Computer Science',
            LinkedInConnections: 450,
            Skills: 'React Native,Python,JavaScript,Machine Learning,Node.js,AWS,Git',
            ProfileImageURL: null, // No random images
            Score: 0,
            Rank: 0,
            Location: 'San Francisco Bay Area',
            Experience: 'Software Engineer Intern at Google, Full Stack Developer at Berkeley Startup, Research Assistant at UC Berkeley',
            GraduationYear: '2025'
          };
        }
      } catch (e) {
        console.log('Failed to load user profile, using mock:', e);
      }
      const userAsLeaderboard = profileToLeaderboardFormat(userProfile);
      
      if (cleanedData && cleanedData.length > 0) {
        console.log(`✅ Loaded ${cleanedData.length} cleaned student records`);
        
        // Get the user's name for comparison
        const userName = userAsLeaderboard.Name || '';
        
        // Find the user's true rank among all people in the CSV
        const userRank = cleanedData.findIndex(
          student => (student.Name || '').toLowerCase().trim() === userName.toLowerCase().trim()
        ) + 1; // +1 because findIndex is 0-based
        
        // Update user's rank
        userAsLeaderboard.Rank = userRank > 0 ? userRank : cleanedData.length + 1;
        userAsLeaderboard.rank = userAsLeaderboard.Rank;
        
        // Filter out the current user from the data and get top 20
        const filteredData = cleanedData.filter(
          student => (student.Name || '').toLowerCase().trim() !== userName.toLowerCase().trim()
        );
        
        // Get top 20 students (excluding the current user)
        let top20 = filteredData.slice(0, 20);
        
        // Add the user to the leaderboard with their true rank
        const combinedData = [...top20, userAsLeaderboard];
        
        // Transform data for display (ensure proper image mapping)
        const transformedData = combinedData.map(user => {
          // Use only actual profile images, no fallbacks
          let profileImageURL = user.ProfileImageURL || user.image || user.profilePicture;
          
          return {
            ...user,
            ProfileImageURL: profileImageURL, // Keep as is, even if null
          };
        });
        setLeaderboardData(transformedData);
        setDataSource('real');
        setTotalStudents(cleanedData.length);
        // Note: Claude analysis is now only triggered manually via the "Get Claude AI Ranking" button
      } else {
        throw new Error('No data found in cleaned dataset');
      }
    } catch (error) {
      console.error('❌ Error loading cleaned data:', error);
      Alert.alert(
        'Data Loading Error',
        'Unable to load Berkeley student data. Please check that berkeleyData.json exists and contains valid data.',
        [{ text: 'OK' }]
      );
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  };

  const loadStoredClaudeAnalysis = async () => {
    try {
      console.log('📱 Loading stored Claude analysis...');
      
      // Load stored ranking data
      const storedRankings = await getClaudeResponsesByType('ranking');
      if (storedRankings.length > 0) {
        const latestRanking = storedRankings[storedRankings.length - 1];
        setClaudeRanking(latestRanking.data);
        
        if (latestRanking.data.success && latestRanking.data.ranking && latestRanking.data.ranking.rankings) {
          // Reconstruct Claude-ranked data from stored results
          const claudeData = latestRanking.data.ranking.rankings.map((rankedItem, index) => {
            return {
              Name: rankedItem.name,
              Title: '',
              Company: '',
              Major: '',
              LinkedInConnections: 0,
              Skills: '',
              ProfileImageURL: null, // No fallback images
              Score: 0,
              Rank: 0,
              Location: '',
              Experience: '',
              GraduationYear: '',
              ClaudeScore: rankedItem.score || 0,
              ClaudeRank: rankedItem.rank || index + 1,
              ClaudeReasoning: rankedItem.reasoning || '',
              ClaudeStrengths: rankedItem.strengths || [],
              ClaudeAreasForImprovement: rankedItem.areas_for_improvement || []
            };
          });
          setClaudeRankedData(claudeData);
          setUseClaudeRanking(true);
          setAnalysisSource('stored');
          console.log('✅ Loaded stored Claude ranking with', claudeData.length, 'students');
          
          Alert.alert(
            'Stored Analysis Loaded',
            'Loaded previous Claude analysis successfully.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Load stored insights data
      const storedInsights = await getClaudeResponsesByType('insights');
      if (storedInsights.length > 0) {
        const latestInsights = storedInsights[storedInsights.length - 1];
        setClaudeInsights(latestInsights.data);
        console.log('✅ Loaded stored Claude insights');
      }
      
    } catch (error) {
      console.log('⚠️ Failed to load stored Claude analysis:', error);
    }
  };

  const getClaudeAnalysis = async () => {
    try {
      setClaudeLoading(true);
      console.log('🤖 Getting Claude ranking analysis...');
      
      // Get the user's real profile from storage
      let userProfile = null;
      try {
        const storedResult = await getStoredLinkedInProfile();
        if (storedResult.success && storedResult.profile) {
          userProfile = storedResult.profile;
        } else {
          // Fallback to mock profile if no stored profile
          userProfile = {
            Name: 'John Doe',
            Title: 'Software Engineer at Berkeley',
            Company: 'Berkeley Startup',
            Major: 'Computer Science',
            LinkedInConnections: 450,
            Skills: 'React Native,Python,JavaScript,Machine Learning,Node.js,AWS,Git',
            ProfileImageURL: null, // No random images
            Score: 0,
            Rank: 0,
            Location: 'San Francisco Bay Area',
            Experience: 'Software Engineer Intern at Google, Full Stack Developer at Berkeley Startup, Research Assistant at UC Berkeley',
            GraduationYear: '2025'
          };
        }
      } catch (e) {
        console.log('Failed to load user profile, using mock:', e);
        userProfile = {
          Name: 'John Doe',
          Title: 'Software Engineer at Berkeley',
          Company: 'Berkeley Startup',
          Major: 'Computer Science',
          LinkedInConnections: 450,
          Skills: 'React Native,Python,JavaScript,Machine Learning,Node.js,AWS,Git',
          ProfileImageURL: null, // No random images
          Score: 0,
          Rank: 0,
          Location: 'San Francisco Bay Area',
          Experience: 'Software Engineer Intern at Google, Full Stack Developer at Berkeley Startup, Research Assistant at UC Berkeley',
          GraduationYear: '2025'
        };
      }
      
      // Convert user profile to leaderboard format
      const userAsLeaderboard = profileToLeaderboardFormat(userProfile);
      
      // Get top 20 students from real Excel data (excluding the current user)
      const allStudents = await getTopPerformers(50); // Get more to ensure we have enough after filtering
      const userName = userAsLeaderboard.Name || '';
      
      // Filter out the current user and get top 20
      const filteredStudents = allStudents.filter(
        student => (student.Name || '').toLowerCase().trim() !== userName.toLowerCase().trim()
      );
      const top20Students = filteredStudents.slice(0, 20);
      
      // Combine top 20 students with user profile for Claude analysis
      const studentsForClaude = [...top20Students, userAsLeaderboard];
      
      console.log('📊 Sending to Claude:', studentsForClaude.length, 'students (top 20 excluding user + user profile)');
      
      // Get Claude's ranking analysis with all 21 students (top 20 excluding user + user profile)
      const rankingResult = await getClaudeRanking(studentsForClaude, userAsLeaderboard);
      setClaudeRanking(rankingResult);
      
      // Store ranking results
      if (rankingResult.success) {
        await storeUserAnalysis('ranking', rankingResult);
      }
      
      // Get industry insights with all 20 students
      const insightsResult = await getClaudeIndustryInsights(studentsForClaude);
      setClaudeInsights(insightsResult);
      
      // Store insights results
      if (insightsResult.success) {
        await storeUserAnalysis('insights', insightsResult);
      }
      
      console.log('✅ Claude analysis completed');
      
      if (rankingResult.success && rankingResult.ranking && rankingResult.ranking.rankings) {
        console.log('🎯 Claude ranking result structure:', {
          success: rankingResult.success,
          hasRanking: !!rankingResult.ranking,
          hasRankings: !!rankingResult.ranking.rankings,
          rankingsLength: rankingResult.ranking.rankings?.length
        });
        
        // Create Claude-ranked data by combining original data with Claude's rankings
        const claudeData = rankingResult.ranking.rankings.map((rankedItem, index) => {
          // Find the original student data
          const originalItem = studentsForClaude.find(item => 
            (item.Name || item.name || '').toLowerCase().trim() === (rankedItem.name || '').toLowerCase().trim()
          );
          
          // Use only actual profile images, no fallbacks
          const profileImageURL = originalItem?.ProfileImageURL || originalItem?.image || originalItem?.profilePicture || null;
          
          // If original item not found, create a basic item
          const baseItem = originalItem || {
            Name: rankedItem.name,
            Title: '',
            Company: '',
            Major: '',
            LinkedInConnections: 0,
            Skills: '',
            ProfileImageURL: null, // No fallback images
            Score: 0,
            Rank: 0,
            Location: '',
            Experience: '',
            GraduationYear: ''
          };
          
          return {
            ...baseItem,
            ProfileImageURL: profileImageURL, // Use actual image or null
            ClaudeScore: rankedItem.score || 0,
            ClaudeRank: rankedItem.rank || index + 1,
            ClaudeReasoning: rankedItem.reasoning || '',
            ClaudeStrengths: rankedItem.strengths || [],
            ClaudeAreasForImprovement: rankedItem.areas_for_improvement || []
          };
        });
        
        console.log('📊 Created Claude data with', claudeData.length, 'students');
        console.log('🔍 Expected 20 students, got', claudeData.length, 'from Claude');
        console.log('🔍 First Claude item:', claudeData[0]);
        
        setClaudeRankedData(claudeData);
        setUseClaudeRanking(true);
        setAnalysisSource('fresh');
        
        console.log('✅ State updated: useClaudeRanking = true, claudeRankedData set');
        
        Alert.alert(
          'Claude Analysis Complete',
          `Claude AI has analyzed and ranked ${claudeData.length} students from your Excel data. The leaderboard now shows Claude's assessment.`,
          [{ text: 'OK' }]
        );
      } else {
        // --- NEW: Add robust fallback parsing ---
        let parsedData = null;
        if (rankingResult.rawResponse) {
          try {
            const jsonMatch = rankingResult.rawResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error('Fallback parsing failed:', e);
          }
        }

        if (parsedData && parsedData.rankings) {
          console.log('✅ Successfully parsed with fallback logic.');
          // Reprocess with the newly parsed data (this is a simplified version of the above success block)
          const claudeData = parsedData.rankings.map((rankedItem, index) => {
            const originalItem = studentsForClaude.find(item => 
              (item.Name || item.name || '').toLowerCase().trim() === (rankedItem.name || '').toLowerCase().trim()
            );
            return {
              ...(originalItem || { Name: rankedItem.name }),
              ClaudeScore: rankedItem.score || 0,
              ClaudeRank: rankedItem.rank || index + 1,
              ClaudeReasoning: rankedItem.reasoning || '',
              ClaudeStrengths: rankedItem.strengths || [],
              ClaudeAreasForImprovement: rankedItem.areas_for_improvement || []
            };
          });
          setClaudeRankedData(claudeData);
          setUseClaudeRanking(true);
          setAnalysisSource('fresh');
          Alert.alert('Claude Analysis Complete', `Claude AI has ranked ${claudeData.length} students. The leaderboard is now updated.`);
        } else {
          // Original failure logic
          console.log('⚠️ Claude ranking result structure issue, even after fallback:', {
            success: rankingResult.success,
            hasRanking: !!rankingResult.ranking,
            hasRankings: !!rankingResult.ranking?.rankings,
            rawResponse: rankingResult.rawResponse?.substring(0, 200) + '...'
          });
          
          Alert.alert(
            'Claude Analysis Complete',
            'Claude AI has provided analysis, but the ranking format was not as expected. Check the insights below.',
            [{ text: 'OK' }]
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Error getting Claude analysis:', error);
      Alert.alert(
        'Claude Analysis Failed',
        'Unable to get Claude AI analysis. Please check your API key and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setClaudeLoading(false);
    }
  };

  const toggleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    
    // Sort the data by score (connections/10)
    const sortedData = [...leaderboardData].sort((a, b) => {
      const scoreA = a.Score || 0;
      const scoreB = b.Score || 0;

      if (newSortOrder === 'desc') {
        return scoreB - scoreA; // Highest first
      } else {
        return scoreA - scoreB; // Lowest first
      }
    });
    
    setLeaderboardData(sortedData);
  };

  const getDisplayData = () => {
    console.log('🔍 getDisplayData called:');
    console.log('  - useClaudeRanking:', useClaudeRanking);
    console.log('  - claudeRankedData.length:', claudeRankedData.length);
    console.log('  - leaderboardData.length:', leaderboardData.length);
    
    if (useClaudeRanking && claudeRankedData.length > 0) {
      console.log('✅ Using Claude ranked data with', claudeRankedData.length, 'students');
      // Use Claude's ranked data (only the students Claude analyzed)
      return claudeRankedData;
    }
    console.log('📊 Using original leaderboard data with', leaderboardData.length, 'students');
    return leaderboardData;
  };

  const displayData = getDisplayData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Berkeley Leaderboard</Text>
          {dataSource && (
            <Text style={styles.dataSourceText}>
              {dataSource === 'real' ? '📊 Real Data' : dataSource === 'mock' ? '⚠️ Sample Data' : '❌ Error'}
              {useClaudeRanking && analysisSource === 'fresh' && ' • 🤖 Fresh Claude Analysis'}
              {useClaudeRanking && analysisSource === 'stored' && ' • 📱 Stored Claude Analysis'}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
          <Entypo 
            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
            size={20} 
            color="#005582" 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Berkeley student data...</Text>
            <Text style={styles.loadingSubtext}>Analyzing with Claude AI</Text>
          </View>
        ) : (
          <>
            {dataSource === 'mock' && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Showing sample data. Please check your ALLCSDATA.xlsx conversion.
                </Text>
              </View>
            )}
            
            {dataSource === 'real' && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  ✅ Using real data from ALLCSDATA.xlsx ({displayData.length} students)
                </Text>
              </View>
            )}
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📈 Leaderboard Statistics</Text>
              <Text style={styles.statsText}>
                {useClaudeRanking 
                  ? `Claude AI Ranked: ${displayData.length} students (top performers)`
                  : `Total Students: ${displayData.length}`
                }
                {useClaudeRanking && ' • 🤖 AI Analysis'}
              </Text>
            </View>

            {!useClaudeRanking && (
              <View style={styles.claudeOptionsContainer}>
                <TouchableOpacity 
                  style={styles.claudeButton} 
                  onPress={getClaudeAnalysis}
                  disabled={claudeLoading}
                >
                  <Text style={styles.claudeButtonText}>
                    {claudeLoading ? '🤖 Claude is analyzing...' : '🤖 Get Fresh Claude Analysis'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.claudeButton, styles.loadStoredButton]} 
                  onPress={loadStoredClaudeAnalysis}
                >
                  <Text style={styles.claudeButtonText}>
                    📱 Load Previous Analysis
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {useClaudeRanking && claudeInsights && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>🤖 Claude's Industry Insights</Text>
                <Text style={styles.insightsText}>
                  {claudeInsights.insights}
                </Text>
              </View>
            )}

            {/* Debug toggle button */}
            {claudeRankedData.length > 0 && (
              <TouchableOpacity 
                style={[styles.claudeButton, { backgroundColor: useClaudeRanking ? '#28a745' : '#005582' }]} 
                onPress={() => {
                  setUseClaudeRanking(!useClaudeRanking);
                  console.log('🔄 Toggled useClaudeRanking to:', !useClaudeRanking);
                }}
              >
                <Text style={styles.claudeButtonText}>
                  {useClaudeRanking ? '📊 Show Original Data' : '🤖 Show Claude Ranking'}
                </Text>
              </TouchableOpacity>
            )}
            
            {displayData.map((item, index) => (
              <LeaderboardItem 
                key={index}
                item={item}
                index={index}
                isFirst={index === 0}
                useClaudeRanking={useClaudeRanking}
                navigation={navigation}
                totalStudents={totalStudents}
              />
            ))}
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {useClaudeRanking 
                  ? '🏆 Rankings by Claude AI based on professional achievements and potential'
                  : '🏆 Top performers based on LinkedIn connections and professional achievements'
                }
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
  },
  dataSourceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sortButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  loadingSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
  },
  profileContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  connectionsText: {
    fontSize: 12,
    color: '#005582',
    marginBottom: 2,
  },
  skillsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  claudeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    gap: 12,
  },
  claudeButton: {
    backgroundColor: '#005582',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadStoredButton: {
    backgroundColor: '#6c757d',
  },
  claudeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#666',
  },
  claudeReasoningText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  claudeStrengthsText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  originalScoreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  successContainer: {
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  successText: {
    color: '#3c763d',
    fontSize: 14,
    textAlign: 'center',
  },
  insightsTimestamp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default LeaderboardScreen; 