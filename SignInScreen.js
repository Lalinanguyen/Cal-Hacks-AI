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

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // For now, just navigate to main app
      // In a real app, you'd validate credentials here
      console.log('Signing in with:', email);
      navigation.navigate('MainApp');
    } catch (error) {
      Alert.alert('Error', 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLinkedInLoading(true);
    try {
      console.log('🔐 Starting LinkedIn authentication...');
      
      // Try to get LinkedIn profile
      const result = await getLinkedInProfile();
      
      if (result.success) {
        console.log('✅ LinkedIn authentication successful!');
        console.log('Profile data:', result.profile);
        
        Alert.alert(
          'Success!',
          `Welcome ${result.profile.firstName} ${result.profile.lastName}!`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('MainApp')
            }
          ]
        );
      } else {
        console.log('❌ LinkedIn authentication failed:', result.error);
        Alert.alert(
          'LinkedIn Authentication Failed',
          result.error || 'Unable to authenticate with LinkedIn. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error during LinkedIn sign in:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during LinkedIn authentication.',
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