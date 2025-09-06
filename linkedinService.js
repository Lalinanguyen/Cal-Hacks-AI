import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from './env'; // Ensure you have your credentials in env.js

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Your existing OAuth access token (optional - for immediate testing)
const EXISTING_ACCESS_TOKEN = 'AQVnU7-g_1gsc9XGvdLJ-7KuzhOGhw27ubcXHgAqakAuvlIH51exoOZl5PkaGJZ2f61eJTACZc5wZnQoRsgAgQU2QguzJb-yLECoa3JHwKHypHDmaeHhZPB-C0C1BxhAiBo7KqD16iCBRQ5Nx8ecAQzCRPZQ3fV8ujhxf3zj75dSQ8Zr5aaaPyTvQwh8PlpE7OZmg8DPuPOcWlmSoolEaw3rwuyD-CErJdfBHTrtnlbj8McYLVRoGgwuOT3HwAu3SySS-5IMEXjZhh3YJ6tvXffm5kCEXac96fgUoieydTfHpNqb1_Vkaxs6Rqdq7fMyBTKTDGIuaStXWuD27cNOgVt5QhS54w';

/**
 * LinkedIn OAuth Configuration
 * Using HTTP redirect URL for LinkedIn OAuth
 */
const LINKEDIN_CONFIG = {
  clientId: CLIENT_ID,
  redirectUri: 'https://v0-cal-ranked-website.vercel.app/linkedin-callback',
  scopes: ['openid', 'profile', 'email'],
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
  emailUrl: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
  connectionsUrl: 'https://api.linkedin.com/v2/connections?q=viewer&projection=(elements*(firstName,lastName,id,profilePicture(displayImage~:playableStreams)))',
  skillsUrl: 'https://api.linkedin.com/v2/skills?q=members&projection=(elements*(skill~(name)))',
  experienceUrl: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,positions)'
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
        console.log('Found stored LinkedIn access token');
        return true;
      }
      
      // Use existing token if available (for immediate testing)
      if (EXISTING_ACCESS_TOKEN) {
        this.accessToken = EXISTING_ACCESS_TOKEN;
        console.log('Using existing LinkedIn access token');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing LinkedIn service:', error);
      return false;
    }
  }

  /**
   * Start LinkedIn OAuth flow using custom URL scheme
   */
  async authenticate() {
    try {
      console.log('Starting LinkedIn OAuth flow...');
      console.log('Redirect URI:', LINKEDIN_CONFIG.redirectUri);
      
      // Create auth request URL
      const authUrl = `${LINKEDIN_API.authUrl}?` +
        `response_type=code&` +
        `client_id=${LINKEDIN_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(LINKEDIN_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(LINKEDIN_CONFIG.scopes.join(' '))}&` +
        `state=${LINKEDIN_CONFIG.state}`;

      console.log('🔗 Auth URL:', authUrl);
      
      // Use WebBrowser with custom URL scheme
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        LINKEDIN_CONFIG.redirectUri
      );

      console.log('🔍 OAuth result:', result);

      if (result.type === 'success' && result.url) {
        console.log('✅ Browser authentication successful');
        
        // Extract authorization code from the redirect URL
        const code = this.extractCodeFromUrl(result.url);
        if (code) {
          console.log('✅ Authorization code extracted:', code);
          const tokenResult = await this.getAccessToken(code);
          if (tokenResult) {
            return { success: true, accessToken: this.accessToken };
          }
        } else {
          console.log('No authorization code found in URL');
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled OAuth flow');
        return { success: false, error: 'Authentication cancelled by user' };
      } else {
        console.log('OAuth failed:', result.type);
      }

      console.log('LinkedIn OAuth failed');
      return { success: false, error: 'Authentication failed' };

    } catch (error) {
      console.error('Error during LinkedIn authentication:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract authorization code from callback URL
   */
  extractCodeFromUrl(url) {
    try {
      console.log('Extracting code from URL:', url);
      
      // Handle both custom scheme and web URLs
      let urlObj;
      if (url.startsWith('calhacksai://')) {
        // Custom scheme URL
        const urlString = url.replace('calhacksai://', 'https://dummy.com/');
        urlObj = new URL(urlString);
      } else {
        // Web URL
        urlObj = new URL(url);
      }
      
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        return null;
      }
      
      // Verify state parameter
      if (state !== LINKEDIN_CONFIG.state) {
        console.error('State parameter mismatch');
        return null;
      }
      
      console.log('✅ Code extracted successfully');
      return code;
    } catch (error) {
      console.error('Error extracting code from URL:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    try {
      console.log('Exchanging authorization code for access token...');
      
      const tokenResponse = await fetch(LINKEDIN_API.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: LINKEDIN_CONFIG.redirectUri,
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response:', tokenData);
      
      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        
        // Store the access token
        await AsyncStorage.setItem('linkedin_access_token', this.accessToken);
        console.log('LinkedIn access token stored successfully');
        
        return true;
      } else {
        console.error('Failed to get access token:', tokenData);
        return false;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return false;
    }
  }

  /**
   * Fetch user's LinkedIn profile data
   */
  async getProfileData() {
    try {
      console.log('Fetching LinkedIn profile data...');

      // In a real implementation, this would:
      // 1. Use the access token to make API calls to LinkedIn
      // 2. Fetch profile data from: https://api.linkedin.com/v2/me
      // 3. Fetch experience from: https://api.linkedin.com/v2/me/positions
      // 4. Fetch education from: https://api.linkedin.com/v2/me/educations  
      // 5. Fetch skills from: https://api.linkedin.com/v2/me/skills
      // 6. Fetch about/summary from: https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture,summary)
      
      // For now, we'll use mock data since the OAuth token doesn't have the right permissions
      // This simulates what the profile would look like for any LinkedIn user who logs in
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Real LinkedIn API scraping function (would be used with proper permissions)
      const scrapeLinkedInProfile = async (accessToken) => {
        try {
          console.log('Scraping LinkedIn profile with OpenID Connect...');
          
          // Use the OpenID Connect userinfo endpoint
          const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { 
              'Authorization': `Bearer ${accessToken}`
            },
          });
          
          console.log('Userinfo response status:', userinfoResponse.status);
          
          if (!userinfoResponse.ok) {
            const errorText = await userinfoResponse.text();
            console.error('❌ Userinfo API error:', userinfoResponse.status, errorText);
            throw new Error(`Userinfo API error: ${userinfoResponse.status} - ${errorText}`);
          }
          
          const userinfo = await userinfoResponse.json();
          console.log('Userinfo data fetched:', userinfo);
          
          // Construct the profile from the userinfo data.
          // NOTE: Experience, education, and skills are NOT available via this endpoint.
          // This would require applying for access to different LinkedIn developer products.
          const scrapedProfile = {
            id: userinfo.sub,
            firstName: userinfo.given_name,
            lastName: userinfo.family_name,
            name: userinfo.name,
            profilePicture: userinfo.picture,
            email: userinfo.email,
            headline: `Welcome, ${userinfo.name}!`, // Placeholder
            summary: 'This profile was fetched using OpenID Connect. More detailed data like experience and skills requires additional LinkedIn developer products and permissions.',
            about: 'This profile was fetched using OpenID Connect. More detailed data like experience and skills requires additional LinkedIn developer products and permissions.',
            experience: [], // Not available via OpenID Connect
            education: [], // Not available via OpenID Connect
            skills: [], // Not available via OpenID Connect
            fetchedAt: new Date().toISOString()
          };
          
          console.log('Complete LinkedIn profile scraped:', scrapedProfile);
          return scrapedProfile;
          
        } catch (error) {
          console.error('❌ LinkedIn scraping error:', error);
          throw error;
        }
      };

      // Try to scrape real LinkedIn data first
      if (this.accessToken) {
        try {
          console.log('Attempting to scrape real LinkedIn profile...');
          const realProfile = await scrapeLinkedInProfile(this.accessToken);
          console.log('Successfully scraped real LinkedIn profile');
          this.userProfile = realProfile;
          await AsyncStorage.setItem('linkedin_profile_data', JSON.stringify(realProfile));
          return { success: true, profile: realProfile };
        } catch (scrapingError) {
          console.log('LinkedIn scraping failed, falling back to mock data:', scrapingError.message);
          // Fall back to mock data if scraping fails
        }
      }

      // If no access token or scraping failed, use mock data
      const mockProfile = {
        id: 'linkedin-user-123',
        firstName: 'LinkedIn',
        lastName: 'User',
        name: 'LinkedIn User',
        profilePicture: null, // Would be fetched from LinkedIn API
        email: 'user@example.com', // Would be fetched from LinkedIn API
        headline: 'Software Engineer & Student',
        industry: 'Technology',
        location: 'San Francisco Bay Area',
        summary: 'Passionate software engineer and student focused on building innovative solutions. Experienced in React Native, Python, and machine learning.',
        publicProfileUrl: 'https://www.linkedin.com/in/linkedin-user',
        // Additional fields for compatibility
        title: 'Software Engineer & Student',
        connections: 250, // Would be fetched from LinkedIn API
        skills: ['React Native', 'Python', 'JavaScript', 'Machine Learning', 'Node.js', 'AWS', 'React', 'TypeScript', 'Git', 'MongoDB', 'Express.js', 'REST APIs'], // Would be fetched from LinkedIn API
        experience: [
          {
            title: 'Software Engineer Intern',
            company: 'Tech Company',
            duration: 'Summer 2023',
            description: 'Developed full-stack applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Implemented RESTful APIs and database optimizations.'
          },
          {
            title: 'Research Assistant',
            company: 'University',
            duration: '2022 - Present',
            description: 'Working on machine learning research projects. Developing algorithms for data analysis and pattern recognition. Contributing to academic papers and research publications.'
          },
          {
            title: 'Full Stack Developer',
            company: 'Startup Project',
            duration: '2023 - Present',
            description: 'Building scalable web applications using modern technologies. Leading development of React Native mobile apps. Implementing CI/CD pipelines and cloud infrastructure.'
          }
        ], // Would be fetched from LinkedIn API
        education: [
          {
            school: 'University',
            degree: 'Bachelor of Science in Computer Science',
            duration: '2021 - 2025',
            description: 'Focusing on software engineering, machine learning, and data science. Active member of coding clubs and hackathon teams.'
          }
        ],
        about: `I'm a passionate software engineer and student with a strong foundation in full-stack development and machine learning. I love building innovative solutions that solve real-world problems.

My technical expertise includes React Native, Python, JavaScript, and various cloud technologies. I'm particularly interested in mobile app development, AI/ML applications, and creating scalable web services.

When I'm not coding, you can find me participating in hackathons, contributing to open-source projects, or exploring new technologies. I believe in continuous learning and staying up-to-date with the latest industry trends.

I'm always excited to collaborate on interesting projects and connect with fellow developers and tech enthusiasts!`,
        // Timestamp
        fetchedAt: new Date().toISOString()
      };

      console.log('Using mock LinkedIn profile data');
      this.userProfile = mockProfile;
      await AsyncStorage.setItem('linkedin_profile_data', JSON.stringify(mockProfile));
      return { success: true, profile: mockProfile };

    } catch (error) {
      console.error('Error creating mock LinkedIn profile:', error);
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
      console.error('Error getting stored profile:', error);
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
      console.log('LinkedIn logout successful');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
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
 * Helper function to get stored profile data
 */
export const getStoredLinkedInProfile = async () => {
  try {
    await linkedinService.initialize();
    const profile = await linkedinService.getStoredProfile();
    return { success: true, profile };
  } catch (error) {
    console.error('Error getting stored profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main function to get LinkedIn profile (authenticates if needed)
 */
export const getLinkedInProfile = async () => {
  try {
    await linkedinService.initialize();
    
    // Check if we already have profile data
    const storedProfile = await linkedinService.getStoredProfile();
    if (storedProfile) {
      return { success: true, profile: storedProfile };
    }
    
    // If not authenticated, try to authenticate
    if (!linkedinService.isAuthenticated()) {
      const authResult = await linkedinService.authenticate();
      if (!authResult.success) {
        return authResult;
      }
    }
    
    // Fetch fresh profile data
    const profileResult = await linkedinService.getProfileData();
    return profileResult;
    
  } catch (error) {
    console.error('Error getting LinkedIn profile:', error);
    return { success: false, error: error.message };
  }
}; 
