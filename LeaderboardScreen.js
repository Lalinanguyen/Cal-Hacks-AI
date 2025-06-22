import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getCleanedData, getTopPerformers } from './cleaning.js';
import { storeUserAnalysis, getClaudeResponsesByType } from './claudeStorageService';
import { getClaudeRanking, getClaudeIndustryInsights } from './claudeRankingService';
import { getStoredLinkedInProfile } from './linkedinService';

const LeaderboardItem = ({ item, index, isFirst, useClaudeRanking }) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate a fallback color based on the name
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
      return getRankBadge(item.ClaudeRank);
    }
    return getRankBadge(index + 1);
  };

  // Ensure all text values are strings
  const safeName = String(item.Name || 'Unknown');
  const safeTitle = String(item.Title || 'Student');
  const safeCompany = String(item.Company || item.Major || 'UC Berkeley');
  const safeConnections = item.LinkedInConnections ? String(item.LinkedInConnections) : null;
  const safeSkills = item.Skills ? String(item.Skills) : null;
  const safeClaudeReasoning = item.ClaudeReasoning ? String(item.ClaudeReasoning) : null;
  const safeClaudeStrengths = Array.isArray(item.ClaudeStrengths) ? item.ClaudeStrengths : [];

  return (
    <View style={styles.itemContainer}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{getDisplayRank()}</Text>
        {useClaudeRanking && item.ClaudeRank && (
          <Text style={styles.claudeRankText}>Claude #{item.ClaudeRank}</Text>
        )}
      </View>
      
      <View style={styles.profileContainer}>
        {item.ProfileImageURL && !imageError ? (
          <Image
            source={{ uri: item.ProfileImageURL }}
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
    </View>
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
    ProfileImageURL: profile.profilePicture || profile.ProfileImageURL || '',
    image: profile.profilePicture || profile.ProfileImageURL || '',
    Score: profile.score || 0,
    Rank: profile.rank || 0,
    Location: profile.location || '',
    Experience: Array.isArray(profile.experience)
      ? profile.experience.map(e => e.text).join(', ')
      : (profile.experience || ''),
    GraduationYear: profile.graduationYear || profile.GraduationYear || '',
    // Add any other fields as needed
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
          // Fallback to mock profile (same as ProfileScreen)
          userProfile = {
            id: 'mock-profile-id',
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            title: 'Software Engineer at Berkeley',
            headline: 'Software Engineer at Berkeley',
            profilePicture: 'https://picsum.photos/200/200?random=1',
            secondaryPicture: 'https://picsum.photos/80/80?random=2',
            connectionsPicture: 'https://picsum.photos/60/60?random=3',
            email: 'john.doe@berkeley.edu',
            industry: 'Technology',
            location: 'San Francisco Bay Area',
            summary: 'Passionate software engineer with experience in React Native, Python, and machine learning. Currently studying Computer Science at UC Berkeley and working on innovative mobile applications.',
            experience: [
              { id: 1, logo: 'https://picsum.photos/60/60?random=4', text: 'Software Engineer Intern at Google' },
              { id: 2, logo: 'https://picsum.photos/60/60?random=5', text: 'Full Stack Developer at Berkeley Startup' },
              { id: 3, logo: 'https://picsum.photos/60/60?random=6', text: 'Research Assistant at UC Berkeley' },
            ],
            education: [
              { id: 1, logo: 'https://picsum.photos/60/60?random=7', text: 'B.S. in Computer Science at UC Berkeley' },
              { id: 2, logo: 'https://picsum.photos/60/60?random=8', text: 'High School Diploma at Berkeley High' },
            ],
            skills: ['React Native', 'Python', 'JavaScript', 'Machine Learning', 'Node.js', 'AWS', 'Git'],
            connections: 450,
            fetchedAt: new Date().toISOString(),
            graduationYear: '2025',
          };
        }
      } catch (e) {
        console.log('Failed to load user profile, using mock:', e);
      }
      const userAsLeaderboard = profileToLeaderboardFormat(userProfile);
      
      if (cleanedData && cleanedData.length > 0) {
        console.log(`✅ Loaded ${cleanedData.length} cleaned student records`);
        // Get top 19 students
        let top19 = cleanedData.slice(0, 19);
        // Check if user is already in top 19 (by name, case-insensitive)
        const userInTop19 = top19.some(
          s => (s.Name || '').toLowerCase().trim() === (userAsLeaderboard.Name || '').toLowerCase().trim()
        );
        // If not, add user profile as the 20th entry
        let combinedList = userInTop19 ? top19 : [...top19, userAsLeaderboard];
        // Transform data for display (use actual LinkedIn images)
        const transformedData = combinedList.map(user => ({
          ...user,
          ProfileImageURL: user.image || user.ProfileImageURL || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
        }));
        setLeaderboardData(transformedData);
        setDataSource('real');
        // Try to get Claude analysis with this list
        try {
          console.log('🤖 Attempting Claude API analysis...');
          // Use the same combined list for Claude
          const rankingResult = await getClaudeRanking(combinedList, userAsLeaderboard);
          if (rankingResult.success) {
            setClaudeRanking(rankingResult);
            console.log('✅ Claude ranking analysis successful');
            if (rankingResult.ranking && rankingResult.ranking.rankings) {
              // Create Claude-ranked data by combining original data with Claude's rankings
              const claudeData = rankingResult.ranking.rankings.map((rankedItem, index) => {
                // Find the original student data
                const originalItem = combinedList.find(item => 
                  (item.Name || item.name || '').toLowerCase().trim() === (rankedItem.name || '').toLowerCase().trim()
                );
                // If original item not found, create a basic item
                const baseItem = originalItem || {
                  Name: rankedItem.name,
                  Title: '',
                  Company: '',
                  Major: '',
                  LinkedInConnections: 0,
                  Skills: '',
                  ProfileImageURL: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
                  Score: 0,
                  Rank: 0,
                  Location: '',
                  Experience: '',
                  GraduationYear: ''
                };
                return {
                  ...baseItem,
                  ProfileImageURL: baseItem.image || baseItem.ProfileImageURL,
                  ClaudeScore: rankedItem.score || 0,
                  ClaudeRank: rankedItem.rank || index + 1,
                  ClaudeReasoning: rankedItem.reasoning || '',
                  ClaudeStrengths: rankedItem.strengths || [],
                  ClaudeAreasForImprovement: rankedItem.areas_for_improvement || []
                };
              });
              setClaudeRankedData(claudeData);
              setUseClaudeRanking(true);
              Alert.alert(
                'Claude Analysis Complete',
                `Claude AI has analyzed and ranked ${claudeData.length} students. The leaderboard now shows Claude's assessment.`,
                [{ text: 'OK' }]
              );
            }
          }
          const insightsResult = await getClaudeIndustryInsights(combinedList);
          if (insightsResult.success) {
            setClaudeInsights(insightsResult);
            console.log('✅ Claude insights analysis successful');
          }
        } catch (apiError) {
          console.log('⚠️ Claude API analysis failed, but real data is still available');
          console.log('API Error:', apiError.message);
        }
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

  const getClaudeAnalysis = async () => {
    try {
      setClaudeLoading(true);
      console.log('🤖 Getting Claude ranking analysis...');
      
      // Get the user's profile (mock profile for now)
      const userProfile = {
        Name: 'John Doe',
        Title: 'Software Engineer at Berkeley',
        Company: 'Berkeley Startup',
        Major: 'Computer Science',
        LinkedInConnections: 450,
        Skills: 'React Native,Python,JavaScript,Machine Learning,Node.js,AWS,Git',
        ProfileImageURL: 'https://picsum.photos/200/200?random=1',
        Score: 0,
        Rank: 0,
        Location: 'San Francisco Bay Area',
        Experience: 'Software Engineer Intern at Google, Full Stack Developer at Berkeley Startup, Research Assistant at UC Berkeley',
        GraduationYear: '2025'
      };
      
      // Get top 19 students for Claude analysis (reduced to minimize token usage and rate limits)
      const top19Students = await getTopPerformers(19);
      
      // Get Claude's ranking analysis with top 19 + user profile
      const rankingResult = await getClaudeRanking(top19Students, userProfile);
      setClaudeRanking(rankingResult);
      
      // Get industry insights with top 19 students
      const insightsResult = await getClaudeIndustryInsights(top19Students);
      setClaudeInsights(insightsResult);
      
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
          const originalItem = top19Students.find(item => 
            (item.Name || item.name || '').toLowerCase().trim() === (rankedItem.name || '').toLowerCase().trim()
          );
          
          // If original item not found, create a basic item
          const baseItem = originalItem || {
            Name: rankedItem.name,
            Title: '',
            Company: '',
            Major: '',
            LinkedInConnections: 0,
            Skills: '',
            ProfileImageURL: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
            Score: 0,
            Rank: 0,
            Location: '',
            Experience: '',
            GraduationYear: ''
          };
          
          return {
            ...baseItem,
            ProfileImageURL: baseItem.image || baseItem.ProfileImageURL,
            ClaudeScore: rankedItem.score || 0,
            ClaudeRank: rankedItem.rank || index + 1,
            ClaudeReasoning: rankedItem.reasoning || '',
            ClaudeStrengths: rankedItem.strengths || [],
            ClaudeAreasForImprovement: rankedItem.areas_for_improvement || []
          };
        });
        
        console.log('📊 Created Claude data with', claudeData.length, 'students');
        console.log('🔍 First Claude item:', claudeData[0]);
        
        setClaudeRankedData(claudeData);
        setUseClaudeRanking(true);
        
        console.log('✅ State updated: useClaudeRanking = true, claudeRankedData set');
        
        Alert.alert(
          'Claude Analysis Complete',
          `Claude AI has analyzed and ranked ${claudeData.length} students. The leaderboard now shows Claude's assessment.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('⚠️ Claude ranking result structure issue:', {
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
              {useClaudeRanking && ' • 🤖 Claude Ranked'}
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
              <TouchableOpacity 
                style={styles.claudeButton} 
                onPress={getClaudeAnalysis}
                disabled={claudeLoading}
              >
                <Text style={styles.claudeButtonText}>
                  {claudeLoading ? '🤖 Claude is analyzing...' : '🤖 Get Claude AI Ranking'}
                </Text>
              </TouchableOpacity>
            )}

            {useClaudeRanking && claudeInsights && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>🤖 Claude's Industry Insights</Text>
                <Text style={styles.insightsText} numberOfLines={3}>
                  {claudeInsights.insights}
                </Text>
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => Alert.alert('Claude Insights', claudeInsights.insights)}
                >
                  <Text style={styles.viewMoreText}>View Full Insights</Text>
                </TouchableOpacity>
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
  claudeButton: {
    padding: 16,
    backgroundColor: '#005582',
    borderRadius: 8,
    margin: 16,
  },
  claudeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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
  viewMoreButton: {
    padding: 16,
    backgroundColor: '#005582',
    borderRadius: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  claudeRankText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  claudeReasoningText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  claudeStrengthsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  originalScoreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default LeaderboardScreen; 