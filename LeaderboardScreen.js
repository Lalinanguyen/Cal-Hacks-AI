import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getRankedLeaderboardData } from './cleaning';

const LeaderboardItem = ({ user, rank }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.rank}>{rank}</Text>
    <View style={styles.profilePic} />
    <View style={styles.nameContainer}>
      <Text style={styles.nameLabel} numberOfLines={1}>{user.Name}</Text>
    </View>
    <Text style={styles.score}>{user.score}</Text>
  </View>
);

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getRankedLeaderboardData();
      setLeaderboardData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005582" />
          <Text style={styles.loadingText}>Ranking students with AI...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {leaderboardData.map((item, index) => {
            // Check for a tie with the previous item
            const isTie = index > 0 && item.score === leaderboardData[index - 1].score;
            // Determine the rank text
            const rankText = isTie ? 'Tie' : index + 1;
            
            return <LeaderboardItem key={index} user={item} rank={rankText} />;
          })}
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#005582',
  },
  container: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
  },
  nameContainer: {
    flex: 1,
  },
  nameLabel: {
    color: '#333',
    fontSize: 16,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
  },
});

export default LeaderboardScreen; 