import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Navigate to the main app (which contains Profile and other screens)
    navigation.navigate('MainApp');
  };

  const handleAppleSignIn = () => {
    console.log('Sign in with Apple pressed');
  };

  const handleGoogleSignIn = () => {
    console.log('Sign in with Google pressed');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleJoinLinkedIn = () => {
    console.log('Join LinkedIn pressed');
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

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

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
});

export default SignInScreen; 