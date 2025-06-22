import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getLinkedInProfile, getStoredLinkedInProfile } from './linkedinService';
import { scrapeWebsiteData } from './webScraperService';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password || !url) {
      Alert.alert('Error', 'Please enter URL, email, and password');
      return;
    }

    setIsLoading(true);
    try {
      // Use the new web scraper service
      const scrapedData = await scrapeWebsiteData(url, email, password);

      if (scrapedData.success) {
        Alert.alert(
          'Success!',
          `Welcome ${scrapedData.profile.firstName}! Data scraped successfully.`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('MainApp', { userProfile: scrapedData.profile })
            }
          ]
        );
      } else {
        throw new Error(scrapedData.error);
      }
    } catch (error) {
      Alert.alert('Error', `Sign in failed: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLinkedInLoading(true);
    try {
      console.log('🔐 Starting mock LinkedIn authentication...');
      
      // Simulate LinkedIn authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful LinkedIn authentication
      const mockProfile = {
        id: 'mock-linkedin-id',
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer at Berkeley',
        industry: 'Technology',
        location: 'San Francisco Bay Area',
        summary: 'Passionate software engineer with experience in React Native, Python, and machine learning. Currently studying Computer Science at UC Berkeley.',
        profilePicture: 'https://picsum.photos/200/200?random=1',
        email: 'john.doe@berkeley.edu',
        fetchedAt: new Date().toISOString()
      };
      
      console.log('✅ Mock LinkedIn authentication successful!');
      console.log('Mock profile data:', mockProfile);
      
      Alert.alert(
        'Success!',
        `Welcome ${mockProfile.firstName} ${mockProfile.lastName}! Mock LinkedIn authentication successful.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('MainApp')
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error during mock LinkedIn sign in:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during mock LinkedIn authentication.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLinkedInLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    console.log('Sign in with Apple pressed');
    Alert.alert('Coming Soon', 'Apple Sign In will be available soon!');
  };

  const handleGoogleSignIn = () => {
    console.log('Sign in with Google pressed');
    Alert.alert('Coming Soon', 'Google Sign In will be available soon!');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
  };

  const handleJoinLinkedIn = () => {
    console.log('Join LinkedIn pressed');
    Alert.alert('Join LinkedIn', 'Account creation functionality coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.linkedinLogo}>Linked</Text>
        <View style={styles.logoBox}>
          <Text style={styles.logoIn}>in</Text>
        </View>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Sign in</Text>
        
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>or </Text>
          <TouchableOpacity onPress={handleJoinLinkedIn}>
            <Text style={styles.joinLink}>Join LinkedIn</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="URL to Scrape"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.signInButton, isLoading && styles.disabledButton]} 
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          {/* LinkedIn Sign In Button */}
          <TouchableOpacity 
            style={[styles.linkedinButton, isLinkedInLoading && styles.disabledButton]} 
            onPress={handleLinkedInSignIn}
            disabled={isLinkedInLoading}
          >
            {isLinkedInLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.linkedinButtonText}>🔗 Sign in with LinkedIn</Text>
            )}
          </TouchableOpacity>

          {/* Social Login Buttons */}
          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
            <Text style={styles.socialButtonText}>🍎 Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Text style={styles.socialButtonText}>🇬 Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkedinLogo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a66c2',
  },
  logoBox: {
    backgroundColor: '#0a66c2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: -2,
    borderRadius: 2,
  },
  logoIn: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#000000',
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  joinLink: {
    fontSize: 16,
    color: '#0a66c2',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  forgotPassword: {
    fontSize: 16,
    color: '#0a66c2',
    fontWeight: '600',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#0a66c2',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    position: 'relative',
  },
  linkedinButton: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  linkedinButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default SignInScreen; 