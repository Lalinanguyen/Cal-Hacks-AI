import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

/**
 * LinkedIn OAuth Configuration
 * You'll need to set up a LinkedIn app at: https://www.linkedin.com/developers/
 */
const LINKEDIN_CONFIG = {
  clientId: '86w7qwvb426drd', // Your actual LinkedIn Client ID
  redirectUri: 'http://localhost:3000/linkedin-callback', // Use our callback server
  scopes: ['r_liteprofile', 'r_emailaddress'], // Basic profile and email permissions
  responseType: 'code',
  state: 'random_state_string'
};

/**
 * LinkedIn API endpoints
 */
const LINKEDIN_API = {
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  profileUrl: 'https://api.linkedin.com/v2/me',
  emailUrl: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))'
};

/**
 * LinkedIn Service for authentication and profile data
 */
class LinkedInService {
  constructor() {
    this.accessToken = null;
    this.userProfile = null;
  }

  /**
   * Initialize LinkedIn authentication
   */
  async initialize() {
    try {
      // Check if we have a stored access token
      const storedToken = await AsyncStorage.getItem('linkedin_access_token');
      if (storedToken) {
        this.accessToken = storedToken;
        console.log('✅ Found stored LinkedIn access token');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error initializing LinkedIn service:', error);
      return false;
    }
  }

  /**
   * Start LinkedIn OAuth flow
   */
  async authenticate() {
    try {
      console.log('🔐 Starting LinkedIn OAuth flow...');
      
      // Create auth request URL
      const authUrl = `${LINKEDIN_API.authUrl}?` +
        `response_type=${LINKEDIN_CONFIG.responseType}&` +
        `client_id=${LINKEDIN_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(LINKEDIN_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(LINKEDIN_CONFIG.scopes.join(' '))}&` +
        `state=${LINKEDIN_CONFIG.state}`;

      console.log('🔗 Auth URL:', authUrl);
      
      // Open the auth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        LINKEDIN_CONFIG.redirectUri
      );

      if (result.type === 'success') {
        console.log('✅ Browser authentication successful');
        
        // Wait a moment for the callback server to receive the code
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the authorization code from our callback server
        try {
          const response = await fetch('http://localhost:3000/get-auth-code');
          const data = await response.json();
          
          if (data.success && data.code) {
            console.log('✅ Authorization code retrieved from callback server');
            const tokenResult = await this.getAccessToken(data.code);
            if (tokenResult) {
              return { success: true, accessToken: this.accessToken };
            }
          } else {
            console.log('❌ No authorization code available from callback server');
          }
        } catch (serverError) {
          console.log('❌ Callback server error:', serverError.message);
          console.log('💡 Make sure the callback server is running: node linkedinCallbackServer.js');
        }
      }

      console.log('❌ LinkedIn OAuth failed or was cancelled');
      return { success: false, error: 'Authentication failed or cancelled. Make sure the callback server is running.' };

    } catch (error) {
      console.error('❌ Error during LinkedIn authentication:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract authorization code from callback URL
   */
  extractCodeFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      
      // Verify state parameter
      if (state !== LINKEDIN_CONFIG.state) {
        console.error('❌ State parameter mismatch');
        return null;
      }
      
      return code;
    } catch (error) {
      console.error('❌ Error extracting code from URL:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    try {
      const tokenResponse = await fetch(LINKEDIN_API.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: LINKEDIN_CONFIG.clientId,
          client_secret: 'WPL_AP1.1NTLBjOYTxjKmjBk.2lywUQ==', 
          redirect_uri: LINKEDIN_CONFIG.redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        
        // Store the access token
        await AsyncStorage.setItem('linkedin_access_token', this.accessToken);
        console.log('✅ LinkedIn access token stored successfully');
        
        return true;
      } else {
        console.error('❌ Failed to get access token:', tokenData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return false;
    }
  }

  /**
   * Fetch user's LinkedIn profile data
   */
  async getProfileData() {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      console.log('📊 Fetching LinkedIn profile data...');

      // Fetch basic profile
      const profileResponse = await fetch(LINKEDIN_API.profileUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const profileData = await profileResponse.json();
      
      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileData.message || 'Unknown error'}`);
      }

      // Fetch email address
      const emailResponse = await fetch(LINKEDIN_API.emailUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const emailData = await emailResponse.json();
      
      // Combine profile and email data
      const userProfile = {
        id: profileData.id,
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName,
        profilePicture: profileData.profilePicture?.displayImage,
        email: emailData.elements?.[0]?.['handle~']?.emailAddress,
        // Additional fields we can fetch
        headline: profileData.headline,
        industry: profileData.industry,
        location: profileData.location,
        summary: profileData.summary,
        publicProfileUrl: profileData.publicProfileUrl,
        // Timestamp
        fetchedAt: new Date().toISOString()
      };

      this.userProfile = userProfile;
      
      // Store profile data
      await AsyncStorage.setItem('linkedin_profile_data', JSON.stringify(userProfile));
      
      console.log('✅ LinkedIn profile data fetched and stored successfully');
      return { success: true, profile: userProfile };

    } catch (error) {
      console.error('❌ Error fetching LinkedIn profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get stored profile data
   */
  async getStoredProfile() {
    try {
      const storedProfile = await AsyncStorage.getItem('linkedin_profile_data');
      if (storedProfile) {
        this.userProfile = JSON.parse(storedProfile);
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting stored profile:', error);
      return null;
    }
  }

  /**
   * Logout and clear stored data
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('linkedin_access_token');
      await AsyncStorage.removeItem('linkedin_profile_data');
      this.accessToken = null;
      this.userProfile = null;
      console.log('✅ LinkedIn logout successful');
      return true;
    } catch (error) {
      console.error('❌ Error during logout:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  /**
   * Get current profile data
   */
  getCurrentProfile() {
    return this.userProfile;
  }
}

// Export singleton instance
export const linkedinService = new LinkedInService();

/**
 * Helper function to get LinkedIn profile data
 */
export const getLinkedInProfile = async () => {
  try {
    // Initialize service
    const isInitialized = await linkedinService.initialize();
    
    if (!isInitialized || !linkedinService.isAuthenticated()) {
      // Need to authenticate
      const authResult = await linkedinService.authenticate();
      if (!authResult.success) {
        return { success: false, error: authResult.error };
      }
    }

    // Get profile data
    const profileResult = await linkedinService.getProfileData();
    return profileResult;

  } catch (error) {
    console.error('❌ Error in getLinkedInProfile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to get stored profile data
 */
export const getStoredLinkedInProfile = async () => {
  try {
    await linkedinService.initialize();
    const profile = await linkedinService.getStoredProfile();
    return { success: true, profile };
  } catch (error) {
    console.error('❌ Error getting stored profile:', error);
    return { success: false, error: error.message };
  }
}; 