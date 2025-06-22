import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { getCurrentProfile, subscribeToProfile } from './profileService';

const SideBar = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Get initial profile data
    const currentProfile = getCurrentProfile();
    if (currentProfile) {
      setProfileData(currentProfile);
    }

    // Subscribe to profile changes
    const unsubscribe = subscribeToProfile((newProfile) => {
      setProfileData(newProfile);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const getDisplayName = () => {
    if (!profileData) return 'Loading...';
    return profileData.name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';
  };

  const getProfileImage = () => {
    if (!profileData) return null;
    return profileData.profilePicture || profileData.secondaryPicture;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#005582" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profilePic} onPress={() => navigation.navigate('Profile')}>
              {getProfileImage() ? (
                <Image 
                  source={{ uri: getProfileImage() }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {getDisplayName().split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.username}>{getDisplayName()}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.viewProfile}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Leaderboard')}>
            <FontAwesome name="bar-chart" size={20} color="white" style={styles.icon} />
            <Text style={styles.menuText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Improvement')}>
            <FontAwesome name="question-circle-o" size={24} color="white" style={styles.icon} />
            <Text style={styles.menuText}>Ask Cal Career</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Insights')}>
            <FontAwesome name="lightbulb-o" size={24} color="white" style={styles.icon} />
            <Text style={styles.menuText}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ClaudeStorage')}>
            <FontAwesome name="database" size={20} color="white" style={styles.icon} />
            <Text style={styles.menuText}>Claude Storage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005582',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewProfile: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  menu: {
    padding: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 20,
  },
  icon: {
    width: 25,
    textAlign: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default SideBar; 