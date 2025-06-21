import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';

// Reusable component for Experience and Education items
const InfoCard = ({ imagePlaceholder, textPlaceholder }) => (
  <View style={styles.cardContainer}>
    <TouchableOpacity style={styles.imagePlaceholder}>
      {/* Later you can replace this with an <Image> component */}
    </TouchableOpacity>
    <View style={styles.textInputPlaceholder} />
  </View>
);

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.mainProfileCircle}>
          {/* Placeholder for the main profile picture */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryProfileCircle}>
          {/* Placeholder for the secondary picture */}
        </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    position: 'relative',
  },
  mainProfileCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e0e0e0',
    borderWidth: 5,
    borderColor: '#005a9c',
  },
  secondaryProfileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#fdb813',
    position: 'absolute',
    top: 0,
    right: 100,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  namePlaceholder: {
    width: '50%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  titlePlaceholder: {
    width: '30%',
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
  },
  textInputPlaceholder: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default ProfileScreen; 