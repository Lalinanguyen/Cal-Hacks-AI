import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getCleanedData } from './dataService';
import { storeUserAnalysis, getClaudeResponsesByType } from './claudeStorageService';
import { getClaudeRanking, getClaudeIndustryInsights } from './claudeRankingService';

const LeaderboardItem = ({ item, index, isFirst, useClaudeRanking }) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate a fallback color based on the name
  const getFallbackColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getRankBadge = (rank) => {
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
          <View style={[styles.profileImage, { backgroundColor: getFallbackColor(item.Name) }]}>
            <Text style={styles.profileInitial}>
              {item.Name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{item.Name}</Text>
        <Text style={styles.titleText}>{item.Title || 'Student'}</Text>
        <Text style={styles.companyText}>{item.Company || item.Major || 'UC Berkeley'}</Text>
        {item.LinkedInConnections && (
          <Text style={styles.connectionsText}>📊 {item.LinkedInConnections} connections</Text>
        )}
        {item.Skills && (
          <Text style={styles.skillsText} numberOfLines={1}>
            💼 {item.Skills.split(',').slice(0, 2).join(', ')}
          </Text>
        )}
        {useClaudeRanking && item.ClaudeReasoning && (
          <Text style={styles.claudeReasoningText} numberOfLines={2}>
            🤖 {item.ClaudeReasoning}
          </Text>
        )}
        {useClaudeRanking && item.ClaudeStrengths && item.ClaudeStrengths.length > 0 && (
          <Text style={styles.claudeStrengthsText} numberOfLines={1}>
            ✅ {item.ClaudeStrengths.slice(0, 2).join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
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
      console.log('Attempting to load real data from JSON dataset...');
      
      // First, try to load real data from the JSON dataset
      const realData = await getCleanedData();
      
      if (realData && realData.length > 0) {
        console.log(`✅ Successfully loaded ${realData.length} entries from JSON dataset`);
        
        // Add sample image URLs and enhance the data
        const enhancedData = realData.map((item, index) => ({
          ...item,
          ProfileImageURL: item.ProfileImageURL || `https://picsum.photos/200/200?random=${index + 1}`,
          Score: item.LinkedInConnections ? Math.floor(item.LinkedInConnections / 10) : Math.floor(Math.random() * 50) + 50
        }));
        
        setLeaderboardData(enhancedData);
        setDataSource('real');
        
        // Try to enhance data with Claude API analysis (optional)
        try {
          console.log('Attempting to enhance data with Claude API...');
          const analysisResult = await storeUserAnalysis(enhancedData.slice(0, 10)); // Analyze first 10 entries
          console.log('✅ Claude API analysis completed and stored successfully');
          console.log('Analysis ID:', analysisResult.id);
          // You could use this analysis to enhance the display
        } catch (apiError) {
          console.log('⚠️ Claude API analysis failed, but real data is still available');
          console.log('API Error:', apiError.message);
          // Continue with real data even if API fails
        }
      } else {
        throw new Error('No data found in JSON dataset');
      }
      
    } catch (error) {
      console.error('❌ Error loading real data:', error);
      
      // Only show mock data if we can't load real data
      console.log('🔄 Falling back to mock data due to data loading failure');
      const mockData = [
        { 
          Name: 'John Doe', 
          Title: 'Software Engineer', 
          Company: 'Tech Corp',
          Major: 'Computer Science',
          LinkedInConnections: 500,
          Skills: 'Python, JavaScript, React',
          ProfileImageURL: 'https://picsum.photos/200/200?random=1',
          Score: 50
        },
        { 
          Name: 'Jane Smith', 
          Title: 'Product Manager', 
          Company: 'Startup Inc',
          Major: 'Business Administration',
          LinkedInConnections: 750,
          Skills: 'Product Strategy, Analytics, Leadership',
          ProfileImageURL: 'https://picsum.photos/200/200?random=2',
          Score: 75
        },
        { 
          Name: 'Mike Johnson', 
          Title: 'Data Scientist', 
          Company: 'AI Labs',
          Major: 'Statistics',
          LinkedInConnections: 300,
          Skills: 'Python, R, Machine Learning',
          ProfileImageURL: 'https://picsum.photos/200/200?random=3',
          Score: 30
        },
        { 
          Name: 'Sarah Wilson', 
          Title: 'UX Designer', 
          Company: 'Design Studio',
          Major: 'Design',
          LinkedInConnections: 450,
          Skills: 'Figma, User Research, Prototyping',
          ProfileImageURL: 'https://picsum.photos/200/200?random=4',
          Score: 45
        },
        { 
          Name: 'David Brown', 
          Title: 'Marketing Manager', 
          Company: 'Marketing Co',
          Major: 'Marketing',
          LinkedInConnections: 600,
          Skills: 'Digital Marketing, Analytics, Strategy',
          ProfileImageURL: 'https://picsum.photos/200/200?random=5',
          Score: 60
        },
        { 
          Name: 'Emily Chen', 
          Title: 'Research Assistant', 
          Company: 'UC Berkeley',
          Major: 'Computer Science',
          LinkedInConnections: 200,
          Skills: 'Machine Learning, Research, Python',
          ProfileImageURL: 'https://picsum.photos/200/200?random=6',
          Score: 20
        },
        { 
          Name: 'Alex Rodriguez', 
          Title: 'Software Developer', 
          Company: 'Google',
          Major: 'Computer Science',
          LinkedInConnections: 800,
          Skills: 'Java, Android, Cloud Computing',
          ProfileImageURL: 'https://picsum.photos/200/200?random=7',
          Score: 80
        },
        { 
          Name: 'Maria Garcia', 
          Title: 'Data Analyst', 
          Company: 'Netflix',
          Major: 'Statistics',
          LinkedInConnections: 350,
          Skills: 'SQL, R, Data Visualization',
          ProfileImageURL: 'https://picsum.photos/200/200?random=8',
          Score: 35
        },
        { 
          Name: 'James Wilson', 
          Title: 'Product Designer', 
          Company: 'Apple',
          Major: 'Design',
          LinkedInConnections: 650,
          Skills: 'UI/UX, Sketch, Prototyping',
          ProfileImageURL: 'https://picsum.photos/200/200?random=9',
          Score: 65
        },
        { 
          Name: 'Lisa Thompson', 
          Title: 'Business Analyst', 
          Company: 'McKinsey',
          Major: 'Business Administration',
          LinkedInConnections: 900,
          Skills: 'Strategy, Consulting, Analytics',
          ProfileImageURL: 'https://picsum.photos/200/200?random=10',
          Score: 90
        }
      ];
      setLeaderboardData(mockData);
      setDataSource('mock');
      
      // Show user-friendly error message
      Alert.alert(
        'Data Loading Issue',
        'Unable to load Berkeley student data. Showing sample data instead. Please check your data file.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getClaudeAnalysis = async () => {
    try {
      setClaudeLoading(true);
      console.log('🤖 Getting Claude ranking analysis...');
      
      // Get Claude's ranking analysis
      const rankingResult = await getClaudeRanking(leaderboardData);
      setClaudeRanking(rankingResult);
      
      // Get industry insights
      const insightsResult = await getClaudeIndustryInsights(leaderboardData);
      setClaudeInsights(insightsResult);
      
      console.log('✅ Claude analysis completed');
      
      if (rankingResult.success && rankingResult.ranking) {
        setUseClaudeRanking(true);
        Alert.alert(
          'Claude Analysis Complete',
          'Claude AI has analyzed and ranked the students. The leaderboard now shows Claude\'s assessment.',
          [{ text: 'OK' }]
        );
      } else {
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
    if (useClaudeRanking && claudeRanking && claudeRanking.ranking && claudeRanking.ranking.rankings) {
      // Use Claude's ranking
      return claudeRanking.ranking.rankings.map((rankedItem, index) => {
        const originalItem = leaderboardData.find(item => item.Name === rankedItem.name);
        return {
          ...originalItem,
          ClaudeScore: rankedItem.score,
          ClaudeRank: rankedItem.rank,
          ClaudeReasoning: rankedItem.reasoning,
          ClaudeStrengths: rankedItem.strengths,
          ClaudeAreasForImprovement: rankedItem.areas_for_improvement
        };
      });
    }
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
                Total Students: {displayData.length}
                {useClaudeRanking && ' • Claude AI Ranked'}
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