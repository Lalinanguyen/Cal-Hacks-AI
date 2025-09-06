import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getLinkedInProfile } from './linkedinService';

const SignInScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    try {
      setLoading(true);
      console.log('Starting LinkedIn login...');
      
      const result = await getLinkedInProfile();
      
      if (result.success && result.profile) {
        console.log('LinkedIn login successful:', result.profile.name);
        Alert.alert(
          'Success!', 
          `Welcome, ${result.profile.name}! Your profile has been loaded.\n\n💡 This is using sample LinkedIn data. You can customize it with your actual information in the code.`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('MainApp')
            }
          ]
        );
      } else {
        console.log('LinkedIn login failed:', result.error);
        Alert.alert('Login Failed', result.error || 'Failed to connect to LinkedIn');
      }
    } catch (error) {
      console.error('Error during LinkedIn login:', error);
      Alert.alert('Error', 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cal Career</Text>
          <Text style={styles.subtitle}>Berkeley Student Leaderboard</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Welcome to the Berkeley Student Leaderboard! Connect your LinkedIn profile to get started.
          </Text>

          <TouchableOpacity
            style={[styles.linkedinButton, loading && styles.buttonDisabled]}
            onPress={handleLinkedInLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Entypo name="linkedin" size={24} color="#fff" />
                <Text style={styles.buttonText}>Continue with LinkedIn</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('MainApp')}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our terms of service and privacy policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  linkedinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0077B5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SignInScreen; 
