import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const LeaderboardItem = ({ name, isFirst }) => (
  <View style={styles.itemContainer}>
    <View style={styles.profilePic} />
    <View style={styles.nameContainer}>
      {isFirst ? (
        <Text style={styles.nameLabel}>Name</Text>
      ) : (
        <Text style={styles.nameText}>{name}</Text>
      )}
    </View>
  </View>
);

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Use mock data instead of getCleanedData to avoid runtime errors
    const mockData = [
      { Name: 'John Doe' },
      { Name: 'Jane Smith' },
      { Name: 'Mike Johnson' },
      { Name: 'Sarah Wilson' },
      { Name: 'David Brown' },
    ];
    setLeaderboardData(mockData);
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
      <ScrollView contentContainerStyle={styles.container}>
        {leaderboardData.map((item, index) => (
          <LeaderboardItem key={index} name={item.Name} isFirst={index === 0} />
        ))}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  nameLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#333',
    fontSize: 16,
  },
});

export default LeaderboardScreen; 