import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons';

// Reusable component for Experience and Education items
const InfoCard = () => (
  <View style={styles.cardContainer}>
    <View style={styles.imagePlaceholder} />
    <View style={styles.textInputPlaceholder} />
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
                <View style={styles.connectionsCircleInner} />
            </View>
            <LinearGradient colors={['#2E96C7', '#0077B5']} style={styles.mainProfileCircle} />
            <LinearGradient colors={['#2E96C7', '#0077B5']} style={styles.secondaryProfileCircle} />
        </View>

        <View style={styles.nameSection}>
            <View style={styles.namePlaceholder} />
            <View style={styles.titlePlaceholder} />
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <InfoCard />
            <InfoCard />
            <InfoCard />
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <InfoCard />
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  secondaryProfileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    top: 0,
    right: 70,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#0077B5',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  namePlaceholder: {
    width: '60%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  titlePlaceholder: {
    width: '40%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
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
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textInputPlaceholder: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default ProfileScreen; 