import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getStoredLinkedInProfile } from './linkedinService';

const ImprovementScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getStoredLinkedInProfile();
      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        // Fallback to mock profile
        setProfile({
          name: 'John Doe',
          title: 'Software Engineer at Berkeley',
          connections: 450,
          skills: ['React Native', 'Python', 'JavaScript', 'Machine Learning'],
          experience: [
            { text: 'Software Engineer Intern at Google' },
            { text: 'Full Stack Developer at Berkeley Startup' },
            { text: 'Research Assistant at UC Berkeley' }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getImprovementSuggestions = () => {
    if (!profile) return [];

    const suggestions = [];

    // Connection-based suggestions
    const connections = profile.connections || 0;
    if (connections < 500) {
      suggestions.push({
        category: 'Network Growth',
        title: 'Expand Your Network',
        description: `You have ${connections} connections. Aim for 500+ to increase your professional visibility.`,
        action: 'Connect with alumni, industry professionals, and classmates.',
        priority: 'High'
      });
    }

    // Skills-based suggestions
    const skills = profile.skills || [];
    if (skills.length < 5) {
      suggestions.push({
        category: 'Skill Development',
        title: 'Add More Skills',
        description: `You have ${skills.length} skills listed. Add more relevant skills to your profile.`,
        action: 'Add skills like Python, JavaScript, React, AWS, or other relevant technologies.',
        priority: 'Medium'
      });
    }

    // Experience-based suggestions
    const experience = profile.experience || [];
    if (experience.length < 3) {
      suggestions.push({
        category: 'Experience',
        title: 'Add More Experience',
        description: `You have ${experience.length} experience entries. Add internships, projects, or volunteer work.`,
        action: 'Include relevant internships, research projects, hackathons, or volunteer experiences.',
        priority: 'High'
      });
    }

    return suggestions;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading improvement suggestions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const suggestions = getImprovementSuggestions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Improvement Suggestions</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Text style={styles.profileTitle}>Your Profile</Text>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileTitle}>{profile?.title || 'Student'}</Text>
          <Text style={styles.profileConnections}>
            📊 {profile?.connections || 0} LinkedIn connections
          </Text>
        </View>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>🎯 Improvement Suggestions</Text>
          
          {suggestions.length === 0 ? (
            <View style={styles.noSuggestionsContainer}>
              <Text style={styles.noSuggestionsText}>
                Great job! Your profile looks strong. Keep building your network and adding relevant experience.
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
                    <Text style={styles.priorityText}>{suggestion.priority}</Text>
                  </View>
                </View>
                
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                
                <View style={styles.actionContainer}>
                  <Text style={styles.actionLabel}>💡 Action:</Text>
                  <Text style={styles.actionText}>{suggestion.action}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 General Tips</Text>
          <Text style={styles.tipText}>• Keep your profile updated with recent experiences</Text>
          <Text style={styles.tipText}>• Engage with your network by liking and commenting on posts</Text>
          <Text style={styles.tipText}>• Share relevant articles and insights</Text>
          <Text style={styles.tipText}>• Join industry-specific LinkedIn groups</Text>
          <Text style={styles.tipText}>• Request recommendations from colleagues and supervisors</Text>
        </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileConnections: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  suggestionsContainer: {
    margin: 16,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 16,
  },
  noSuggestionsContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  noSuggestionsText: {
    color: '#155724',
    fontSize: 16,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#005582',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default ImprovementScreen; 