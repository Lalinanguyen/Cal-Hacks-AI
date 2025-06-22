import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getCleanedData } from './dataService';
import { analyzeUserData } from './claudeService';

const LeaderboardItem = ({ name, isFirst, additionalInfo }) => (
  <View style={styles.itemContainer}>
    <View style={styles.profilePic} />
    <View style={styles.nameContainer}>
      {isFirst ? (
        <Text style={styles.nameLabel}>Name</Text>
      ) : (
        <View>
          <Text style={styles.nameText}>{name}</Text>
          {additionalInfo && (
            <Text style={styles.additionalInfo}>{additionalInfo}</Text>
          )}
        </View>
      )}
    </View>
  </View>
);

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState(''); // 'real', 'mock', or 'error'

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
        setLeaderboardData(realData);
        setDataSource('real');
        
        // Try to enhance data with Claude API analysis (optional)
        try {
          console.log('Attempting to enhance data with Claude API...');
          const analysis = await analyzeUserData(realData.slice(0, 10)); // Analyze first 10 entries
          console.log('✅ Claude API analysis completed successfully');
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
        { Name: 'John Doe', Title: 'Software Engineer', Company: 'Tech Corp' },
        { Name: 'Jane Smith', Title: 'Product Manager', Company: 'Startup Inc' },
        { Name: 'Mike Johnson', Title: 'Data Scientist', Company: 'AI Labs' },
        { Name: 'Sarah Wilson', Title: 'UX Designer', Company: 'Design Studio' },
        { Name: 'David Brown', Title: 'Marketing Manager', Company: 'Marketing Co' },
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

  const toggleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    
    // Sort the data
    const sortedData = [...leaderboardData].sort((a, b) => {
      const valA = a.Name || '';
      const valB = b.Name || '';

      if (valA < valB) {
        return newSortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return newSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setLeaderboardData(sortedData);
  };

  const getAdditionalInfo = (item) => {
    if (item.Title && item.Company) {
      return `${item.Title} at ${item.Company}`;
    } else if (item.Title) {
      return item.Title;
    } else if (item.Company) {
      return item.Company;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          {dataSource && (
            <Text style={styles.dataSourceText}>
              {dataSource === 'real' ? '📊 Real Data' : dataSource === 'mock' ? '⚠️ Sample Data' : '❌ Error'}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
          <Entypo 
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
            size={20} 
            color="#005582" 
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
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
            {leaderboardData.map((item, index) => (
              <LeaderboardItem 
                key={index} 
                name={item.Name} 
                isFirst={index === 0}
                additionalInfo={getAdditionalInfo(item)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    padding: 5,
  },
  container: {
    padding: 20,
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
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  nameContainer: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  nameLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  additionalInfo: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default LeaderboardScreen; 