import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons';

// --- Mock Data ---
// In a real app, this data would come from an API, database, or your CSV file.
const profileData = {
  name: 'John Doe',
  title: 'React Native Developer',
  profilePicture: 'https://via.placeholder.com/160', // Replace with a real image URL
  secondaryPicture: 'https://via.placeholder.com/80', // Replace with a real image URL
  connectionsPicture: 'https://via.placeholder.com/60', // Replace with a real image URL
  experience: [
    { id: 1, logo: 'https://via.placeholder.com/60', text: 'Software Engineer at Company A' },
    { id: 2, logo: 'https://via.placeholder.com/60', text: 'Frontend Developer at Company B' },
    { id: 3, logo: 'https://via.placeholder.com/60', text: 'Intern at Company C' },
  ],
  education: [
    { id: 1, logo: 'https://via.placeholder.com/60', text: 'B.S. in Computer Science' },
  ]
};

const InfoCard = ({ item }) => (
  <View style={styles.cardContainer}>
    <Image source={{ uri: item.logo }} style={styles.imagePlaceholder} />
    <View style={styles.textInputPlaceholder}>
        <Text style={styles.cardText}>{item.text}</Text>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
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
      <ScrollView style={styles.container}>
        <View style={styles.profileCircles}>
            <View style={styles.connectionsCircle}>
                <Text style={styles.connectionsText}>Connections</Text>
                <Image source={{ uri: profileData.connectionsPicture }} style={styles.connectionsCircleInner} />
            </View>
            <Image source={{ uri: profileData.profilePicture }} style={styles.mainProfileCircle} />
            <Image source={{ uri: profileData.secondaryPicture }} style={styles.secondaryProfileCircle} />
        </View>

        <View style={styles.nameSection}>
            <Text style={styles.nameText}>{profileData.name}</Text>
            <Text style={styles.titleText}>{profileData.title}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profileData.experience.map(item => <InfoCard key={item.id} item={item} />)}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profileData.education.map(item => <InfoCard key={item.id} item={item} />)}
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
});

export default ProfileScreen; 