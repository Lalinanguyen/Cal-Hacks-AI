import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Image, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons';
import { 
  getCurrentProfile, 
  subscribeToProfile, 
  loadProfileData, 
  refreshProfile, 
  connectLinkedIn 
} from './profileService';

const InfoCard = ({ item }) => (
  <View style={styles.cardContainer}>
    <Image source={{ uri: item.logo }} style={styles.imagePlaceholder} />
    <View style={styles.textInputPlaceholder}>
        <Text style={styles.cardText}>{item.text}</Text>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProfileDataFromService();
  }, []);

  const loadProfileDataFromService = async () => {
    try {
      setIsLoading(true);
      
      // Get initial profile data from service
      const currentProfile = getCurrentProfile();
      if (currentProfile) {
        setProfileData(currentProfile);
      }

      // Subscribe to profile changes
      const unsubscribe = subscribeToProfile((newProfile) => {
        setProfileData(newProfile);
      });

      // Load profile data if not already loaded
      if (!currentProfile) {
        await loadProfileData();
      }

      // Cleanup subscription on unmount
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true);
      
      const result = await refreshProfile();
      
      if (result.success) {
        console.log('✅ Successfully refreshed LinkedIn profile');
        Alert.alert('Success', 'Profile refreshed successfully!');
      } else {
        console.log('❌ Failed to refresh profile:', result.error);
        Alert.alert('Refresh Failed', result.error || 'Unable to refresh profile data.');
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      Alert.alert('Error', 'An unexpected error occurred while refreshing.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      const result = await connectLinkedIn();
      
      if (result.success) {
        console.log('✅ LinkedIn connection successful!');
        Alert.alert(
          'Success!',
          `Welcome ${result.profile.firstName} ${result.profile.lastName}! Your LinkedIn profile has been connected.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ LinkedIn connection failed:', result.error);
        Alert.alert(
          'Connection Failed',
          result.error || 'Unable to connect to LinkedIn. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error connecting to LinkedIn:', error);
      Alert.alert('Error', 'An unexpected error occurred while connecting to LinkedIn.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Entypo name="dots-three-vertical" size={24} color="#003262" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005582" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLinkedInProfile = profileData && profileData.id; // Check if it's a real LinkedIn profile

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#003262" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <TouchableOpacity onPress={handleRefreshProfile} disabled={isRefreshing}>
          <Entypo name="cycle" size={24} color="#003262" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshProfile}
            colors={['#005582']}
          />
        }
      >
        {/* Profile Status Indicator */}
        {isLinkedInProfile && (
          <View style={styles.linkedinStatus}>
            <Text style={styles.linkedinStatusText}>
              ✅ Mock Profile Active • Last updated: {new Date(profileData.fetchedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Mock Profile Notice */}
        {!isLinkedInProfile && (
          <View style={styles.linkedinPrompt}>
            <Text style={styles.linkedinPromptText}>
              🎭 Mock Profile Mode • Using sample data for testing
            </Text>
            <TouchableOpacity style={styles.connectButton} onPress={handleConnectLinkedIn}>
              <Text style={styles.connectButtonText}>Try Real LinkedIn</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.profileCircles}>
            <View style={styles.connectionsCircle}>
                <Text style={styles.connectionsText}>Connections</Text>
                <Image 
                  source={{ uri: profileData.connectionsPicture || 'https://via.placeholder.com/60' }} 
                  style={styles.connectionsCircleInner} 
                />
            </View>
            <Image 
              source={{ uri: profileData.profilePicture || 'https://via.placeholder.com/160' }} 
              style={styles.mainProfileCircle} 
            />
            <Image 
              source={{ uri: profileData.secondaryPicture || 'https://via.placeholder.com/80' }} 
              style={styles.secondaryProfileCircle} 
            />
        </View>

        <View style={styles.nameSection}>
            <Text style={styles.nameText}>
              {isLinkedInProfile 
                ? `${profileData.firstName} ${profileData.lastName}`
                : profileData.name
              }
            </Text>
            <Text style={styles.titleText}>
              {isLinkedInProfile ? profileData.headline : profileData.title}
            </Text>
            {profileData.industry && (
              <Text style={styles.industryText}>{profileData.industry}</Text>
            )}
            {profileData.location && (
              <Text style={styles.locationText}>📍 {profileData.location}</Text>
            )}
        </View>

        {/* Profile Summary */}
        {profileData.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>{profileData.summary}</Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        {profileData.email && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactContainer}>
              <Text style={styles.contactText}>📧 {profileData.email}</Text>
            </View>
          </View>
        )}

        {/* Experience Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profileData.experience ? (
              profileData.experience.map(item => <InfoCard key={item.id} item={item} />)
            ) : (
              <Text style={styles.noDataText}>No experience data available</Text>
            )}
        </View>

        {/* Education Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profileData.education ? (
              profileData.education.map(item => <InfoCard key={item.id} item={item} />)
            ) : (
              <Text style={styles.noDataText}>No education data available</Text>
            )}
        </View>
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
  },
  container: {
    flex: 1,
  },
  profileCircles: {
    marginTop: 20,
    height: 200,
    position: 'relative',
    alignItems: 'center',
  },
  mainProfileCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  secondaryProfileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    top: 0,
    right: 70,
  },
  connectionsCircle: {
    position: 'absolute',
    left: 40,
    top: 50,
    alignItems: 'center',
  },
  connectionsText: {
      color: '#0077B5',
      marginBottom: 5
  },
  connectionsCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#0077B5',
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0077B5'
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
  },
  textInputPlaceholder: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#005582',
    marginTop: 20,
  },
  linkedinPrompt: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  linkedinPromptText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  connectButton: {
    padding: 15,
    backgroundColor: '#005582',
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  linkedinStatus: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#d3d3d3',
    borderRadius: 8,
    alignItems: 'center',
  },
  linkedinStatusText: {
    fontSize: 16,
    color: '#333',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  contactContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  industryText: {
    fontSize: 16,
    color: '#666',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen; 