// Path: ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import {
  subscribeToProfile,
  getCurrentProfile,
  loadProfileData as loadInitialProfile,
  updateProfile,
} from './profileService';
import { linkedinService } from './linkedinService';
import { scrapeLinkedInProfile } from './linkedinScraper'; // Import the scraper
import { CLIENT_ID, CLIENT_SECRET } from './env'; // Make sure CLIENT_ID is exported from env.js
import { getCleanedData } from './cleaning';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// --- LinkedIn Auth Configuration ---
const discovery = {
  authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
};

// Helper function to get fallback color for profile images
const getFallbackColor = (name) => {
  const colors = ['#005582', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c'];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

const InfoCard = ({ item }) => (
  <View style={styles.cardContainer}>
    {item.logo ? (
      <Image source={{ uri: item.logo }} style={styles.imagePlaceholder} />
    ) : (
      <View style={[styles.imagePlaceholder, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 12, color: '#666' }}>No Logo</Text>
      </View>
    )}
    <View style={styles.textInputPlaceholder}>
        <Text style={styles.cardText}>{item.text}</Text>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScraping, setIsScraping] = useState(false); // New state for scraping
  const [profileUrl, setProfileUrl] = useState(''); // New state for URL input
  const [completeProfileData, setCompleteProfileData] = useState(null); // New state for complete profile data
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false); // New state for profile data loading

  // --- New LinkedIn Auth Logic ---
  const redirectUri = makeRedirectUri({
    // For Expo Go, use 'exp'
    // For standalone apps, use your own scheme
    scheme: 'exp', 
    path: 'linkedin-callback'
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['r_liteprofile', 'r_emailaddress'],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response) {
      if (response.type === 'success') {
        const { code } = response.params;
        exchangeCodeForToken(code);
      } else if (response.type === 'error') {
        console.error('Authentication error:', response.error);
        Alert.alert('Authentication Failed', 'Could not connect to LinkedIn. Please try again.');
      }
    }
  }, [response]);

  const exchangeCodeForToken = async (code) => {
    try {
      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }).toString(),
      });

      const tokenResult = await tokenResponse.json();

      if (tokenResult.error) {
        console.error("Error getting token:", tokenResult.error_description);
        Alert.alert('Authentication Failed', 'Could not retrieve account details.');
        return;
      }
      
      fetchUserProfile(tokenResult.access_token);
    } catch (error) {
      console.error('Token exchange error:', error);
    }
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileResult = await profileResponse.json();
      
      const newProfileData = {
          id: profileResult.id,
          firstName: profileResult.firstName.localized.en_US,
          lastName: profileResult.lastName.localized.en_US,
          name: `${profileResult.firstName.localized.en_US} ${profileResult.lastName.localized.en_US}`,
          profilePicture: profileResult.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
          fetchedAt: new Date().toISOString()
      };
      
      updateProfile(newProfileData); // Update the shared profile
      Alert.alert('Success!', 'Your LinkedIn profile has been connected.');

    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  // --- Existing Profile Logic ---
  useEffect(() => {
    const unsubscribe = subscribeToProfile(setProfileData);
    const initialProfile = getCurrentProfile();
    if (initialProfile) {
      setProfileData(initialProfile);
      setIsLoading(false);
    } else {
      loadInitialProfile().finally(() => setIsLoading(false));
    }
    return unsubscribe;
  }, []);

  // Load complete profile data when profileData changes
  useEffect(() => {
    if (profileData) {
      loadCompleteProfileData();
    }
  }, [profileData]);

  const loadCompleteProfileData = async () => {
    try {
      setIsLoadingProfileData(true);
      const data = await getDefaultProfileData();
      setCompleteProfileData(data);
    } catch (error) {
      console.error('Error loading complete profile data:', error);
    } finally {
      setIsLoadingProfileData(false);
    }
  };

  // Function to get user's rank from leaderboard data
  const getUserRank = async (userName) => {
    try {
      const cleanedData = await getCleanedData();
      if (cleanedData && cleanedData.length > 0) {
        const userRank = cleanedData.findIndex(
          student => (student.Name || '').toLowerCase().trim() === (userName || '').toLowerCase().trim()
        ) + 1; // +1 because findIndex is 0-based
        return {
          rank: userRank > 0 ? userRank : cleanedData.length + 1,
          total: cleanedData.length
        };
      }
    } catch (error) {
      console.error('Error getting user rank:', error);
    }
    return { rank: null, total: 0 };
  };

  // Mock data for default profile sections
  const getDefaultProfileData = async () => {
    if (!profileData) return null;
    
    // Get user's rank from leaderboard data
    const userRankData = await getUserRank(profileData.name);
    
    // Get the user's actual data from the CSV dataset
    try {
      const cleanedData = await getCleanedData();
      const userName = profileData.name || '';
      
      // Find the user in the CSV dataset
      const userData = cleanedData.find(
        student => (student.Name || '').toLowerCase().trim() === userName.toLowerCase().trim()
      );
      
      if (userData && userData.experienceData && userData.experienceData.length > 0) {
        // Use actual experience data from CSV with company logos
        const experience = userData.experienceData.map((exp, index) => ({
          id: index,
          logo: exp.company_logo || null, // Use actual company logo from 7th column
          text: exp.title || exp.text || 'Position',
          company: exp.company_name || exp.company || 'Company',
          duration: exp.start_date ? new Date(exp.start_date).getFullYear() + (exp.end_date && exp.end_date !== 'Present' ? ' - ' + new Date(exp.end_date).getFullYear() : ' - Present') : exp.duration || '',
          description: exp.description || '',
          // Generate placeholder image if no logo
          placeholderImage: !exp.company_logo ? {
            backgroundColor: getFallbackColor(exp.company_name || exp.company || 'Company'),
            text: (exp.company_name || exp.company || 'C').charAt(0).toUpperCase()
          } : null
        }));
        
        return {
          ...profileData,
          Rank: userRankData.rank,
          total: userRankData.total,
          summary: userData.summary || profileData.about || profileData.summary || 'Connect your LinkedIn to see your complete profile.',
          experience: experience,
          education: [], // Will be populated if available
          skills: userData.Skills ? userData.Skills.split(',').map(s => s.trim()) : [],
          connections: userData.LinkedInConnections || 0
        };
      }
    } catch (error) {
      console.error('Error fetching user data from CSV:', error);
    }
    
    // If it's a LinkedIn profile, use the LinkedIn data structure
    // In a real implementation, this would be populated from LinkedIn API calls
    if (profileData.id !== 'mock-profile-id') {
      // Parse experience if it's a JSON string
      let experienceList = [];
      if (profileData.experience) {
        if (Array.isArray(profileData.experience)) {
          experienceList = profileData.experience;
        } else if (typeof profileData.experience === 'string') {
          try {
            experienceList = JSON.parse(profileData.experience);
          } catch (e) {
            // If parsing fails, treat as plain text
            experienceList = [{ text: profileData.experience }];
          }
        }
      }
      
      // Parse education if it exists
      let educationList = [];
      if (profileData.education) {
        if (Array.isArray(profileData.education)) {
          educationList = profileData.education;
        } else if (typeof profileData.education === 'string') {
          try {
            educationList = JSON.parse(profileData.education);
          } catch (e) {
            // If parsing fails, treat as plain text
            educationList = [{ text: profileData.education }];
          }
        }
      }
      
      return {
        ...profileData,
        Rank: userRankData.rank, // Add the user's rank
        total: userRankData.total,
        // Use the about field from LinkedIn data (would be fetched from LinkedIn API)
        summary: profileData.about || profileData.summary || 'Connect your LinkedIn to see your complete profile.',
        // Convert parsed experience to display format
        experience: experienceList.map((exp, index) => ({
          id: index,
          logo: exp.company_logo || exp.companyLogo || exp.logo || null, // Use company logo from 7th column
          text: exp.title || exp.text || 'Position',
          company: exp.company_name || exp.company || 'Company',
          duration: exp.start_date ? new Date(exp.start_date).getFullYear() + (exp.end_date && exp.end_date !== 'Present' ? ' - ' + new Date(exp.end_date).getFullYear() : ' - Present') : exp.duration || '',
          description: exp.description || '',
          // Generate placeholder image if no logo
          placeholderImage: !exp.company_logo && !exp.companyLogo && !exp.logo ? {
            backgroundColor: getFallbackColor(exp.company_name || exp.company || 'Company'),
            text: (exp.company_name || exp.company || 'C').charAt(0).toUpperCase()
          } : null
        })),
        // Convert parsed education to display format
        education: educationList.map((edu, index) => ({
          id: index,
          logo: edu.logo || null, // Use actual logo or null, no random images
          text: edu.text || edu.degree || 'Degree',
          school: edu.school || edu.institution || 'School',
          duration: edu.duration || '',
          description: edu.description || '',
          // Generate placeholder image if no logo
          placeholderImage: !edu.logo ? {
            backgroundColor: getFallbackColor(edu.school || edu.institution || 'School'),
            text: (edu.school || edu.institution || 'S').charAt(0).toUpperCase()
          } : null
        })),
        skills: profileData.skills || [], // Would be fetched from LinkedIn API
        connections: profileData.connections || 0 // Would be fetched from LinkedIn API
      };
    }
    
    // Mock data for default profile (John Doe)
    return {
      ...profileData,
      Rank: userRankData.rank, // Add the user's rank
      total: userRankData.total,
      summary: 'Passionate software engineer and UC Berkeley student with experience in full-stack development, machine learning, and mobile app development. Always eager to learn new technologies and contribute to innovative projects.',
      experience: [
        {
          id: 1,
          logo: null, // No random images, use actual data
          text: 'Software Engineering Intern',
          company: 'Google',
          duration: 'May 2024 - Aug 2024',
          description: 'Developed full-stack applications using React, Node.js, and Google Cloud Platform. Collaborated with cross-functional teams to deliver high-quality software solutions.',
          placeholderImage: {
            backgroundColor: getFallbackColor('Google'),
            text: 'G'
          }
        },
        {
          id: 2,
          logo: null, // No random images, use actual data
          text: 'Full Stack Developer',
          company: 'Berkeley Startup',
          duration: 'Jan 2024 - Present',
          description: 'Building scalable web applications using modern technologies. Leading development of key features and mentoring junior developers.',
          placeholderImage: {
            backgroundColor: getFallbackColor('Berkeley Startup'),
            text: 'B'
          }
        },
        {
          id: 3,
          logo: null, // No random images, use actual data
          text: 'Research Assistant',
          company: 'UC Berkeley',
          duration: 'Sep 2023 - Present',
          description: 'Conducting research in machine learning and computer vision. Implementing algorithms and analyzing large datasets.',
          placeholderImage: {
            backgroundColor: getFallbackColor('UC Berkeley'),
            text: 'U'
          }
        }
      ],
      education: [
        {
          id: 1,
          logo: null, // No random images, use actual data
          text: 'B.S. in Computer Science',
          school: 'UC Berkeley',
          duration: 'Expected 2025',
          description: 'Focus on software engineering, algorithms, and machine learning. GPA: 3.8/4.0',
          placeholderImage: {
            backgroundColor: getFallbackColor('UC Berkeley'),
            text: 'U'
          }
        }
      ],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Mobile Development', 'AWS', 'Docker'],
      connections: 250
    };
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing profile data...');
      
      // If user has a LinkedIn profile, refresh it using the LinkedIn service
      if (profileData && profileData.id !== 'mock-profile-id') {
        console.log('🔗 Refreshing LinkedIn profile...');
        const result = await linkedinService.getProfileData();
        
        if (result.success) {
          console.log('✅ LinkedIn profile refreshed successfully');
          // The profile will be automatically updated through the subscription
        } else {
          console.log('⚠️ LinkedIn refresh failed, keeping existing profile');
        }
      } else {
        // If no LinkedIn profile, trigger LinkedIn login
        console.log('🔗 No LinkedIn profile found, triggering login...');
        if (request) {
          promptAsync();
        } else {
          Alert.alert('LinkedIn Login', 'Please connect your LinkedIn account to refresh your profile.');
        }
      }
    } catch (error) {
      console.error('❌ Refresh error:', error);
      Alert.alert('Refresh Failed', 'Unable to refresh profile data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScrapeProfile = async () => {
    if (!profileUrl) {
      Alert.alert('No URL Provided', 'Please paste your public LinkedIn profile URL first.');
      return;
    }
    setIsScraping(true);
    try {
      // Call the simulated scraper
      const scrapedData = await scrapeLinkedInProfile(profileUrl);

      // Merge the scraped data with the existing basic profile
      const currentProfile = getCurrentProfile();
      const mergedProfile = {
        ...currentProfile,
        ...scrapedData,
        summary: scrapedData.summary, // Overwrite summary
        about: scrapedData.summary, // Overwrite about
      };

      // Update the profile, which will trigger a UI re-render
      updateProfile(mergedProfile);

      Alert.alert('Profile Updated!', 'Your detailed profile information has been added.');
    } catch (error) {
      console.error('Scraping simulation failed:', error);
      Alert.alert('Scraping Failed', 'Could not retrieve profile details.');
    } finally {
      setIsScraping(false);
    }
  };

  if (isLoading || isLoadingProfileData || !completeProfileData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005582" />
          <Text style={styles.loadingText}>
            {isLoading ? 'Loading your profile...' : 'Loading profile data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLinkedInProfile = profileData && profileData.id !== 'mock-profile-id';

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Entypo name="dots-three-vertical" size={24} color="#003262" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <TouchableOpacity onPress={handleRefresh}>
                <Entypo name="cycle" size={24} color="#003262" />
            </TouchableOpacity>
        </View>
      
        <ScrollView 
            style={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#005582']}
              />
            }
        >
            {!isLinkedInProfile && (
              <View style={styles.linkedinPrompt}>
                <Text style={styles.linkedinPromptText}>
                  Connect your LinkedIn to see your real profile.
                </Text>
                <TouchableOpacity style={styles.connectButton} onPress={() => promptAsync()} disabled={!request}>
                    <Text style={styles.connectButtonText}>Connect to LinkedIn</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {completeProfileData?.profilePicture ? (
                  <Image 
                    source={{ uri: completeProfileData.profilePicture }} 
                    style={styles.profileImage}
                    onError={() => {
                      // If LinkedIn profile image fails to load, fall back to initials
                      console.log('LinkedIn profile image failed to load, showing initials');
                    }}
                  />
                ) : (
                  <View style={[styles.profileImage, { backgroundColor: getFallbackColor(completeProfileData?.name || 'User') }]}>
                    <Text style={styles.profileInitial}>
                      {(completeProfileData?.name || 'User').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.nameText}>{completeProfileData?.name || 'John Doe'}</Text>
                <Text style={styles.titleText}>{completeProfileData?.headline || 'Software Engineer at Berkeley'}</Text>
                <Text style={styles.locationText}>{completeProfileData?.email || 'No email provided'}</Text>
                <Text style={styles.connectionsText}>📊 {completeProfileData?.connections || 0} connections</Text>
                {completeProfileData?.Rank && (
                  <Text style={styles.rankText}>🥇 Rank: #{completeProfileData.Rank} out of {completeProfileData.total}</Text>
                )}
              </View>
            </View>

            {isLinkedInProfile && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Get Full Profile</Text>
                <Text style={styles.summaryText}>
                  Paste your public LinkedIn URL below to populate your detailed experience.
                </Text>
                <TextInput
                  style={styles.urlInput}
                  placeholder="e.g., https://www.linkedin.com/in/your-name"
                  value={profileUrl}
                  onChangeText={setProfileUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.connectButton, { marginTop: 10, alignSelf: 'center' }]}
                  onPress={handleScrapeProfile}
                  disabled={isScraping}
                >
                  <Text style={styles.connectButtonText}>
                    {isScraping ? 'Getting Details...' : 'Get Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.summaryText}>{completeProfileData?.summary || 'No summary available.'}</Text>
            </View>

            {/* Experience Section */}
            {(isLinkedInProfile || (completeProfileData?.experience && completeProfileData.experience.length > 0)) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                {completeProfileData?.experience && completeProfileData.experience.length > 0 ? (
                  completeProfileData.experience.map((item) => (
                    <View key={item.id} style={styles.experienceCard}>
                      {item.logo ? (
                        <Image
                          source={{ uri: item.logo }}
                          style={styles.experienceLogo}
                          onError={() => {
                            // Company logo failed to load (likely expired LinkedIn URL)
                            // Will show company name instead
                          }}
                        />
                      ) : (
                        <View style={[styles.experienceLogo, { backgroundColor: getFallbackColor(item.company || 'Company'), justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                            {(item.company || 'C').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.experienceContent}>
                        <Text style={styles.experienceTitle}>{item.text}</Text>
                        <Text style={styles.experienceCompany}>{item.company}</Text>
                        {item.duration && (
                          <Text style={styles.experienceDuration}>{item.duration}</Text>
                        )}
                        {item.description && (
                          <Text style={styles.experienceDescription}>{item.description}</Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholderText}>
                    Experience data is not available with the current LinkedIn permissions.
                  </Text>
                )}
              </View>
            )}

            {/* Education Section */}
            {(isLinkedInProfile || (completeProfileData?.education && completeProfileData.education.length > 0)) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {completeProfileData?.education && completeProfileData.education.length > 0 ? (
                  completeProfileData.education.map((item) => {
                    const isBerkeley = (item.school || '').toLowerCase().includes('berkeley');
                    const logoUri = isBerkeley 
                      ? 'https://upload.wikimedia.org/wikipedia/commons/a/a1/UC_Berkeley_wordmark.svg'
                      : item.logo;

                    return (
                      <View key={item.id} style={styles.experienceCard}>
                        {logoUri ? (
                          <Image
                            source={{ uri: logoUri }}
                            style={[
                              styles.experienceLogo, 
                              isBerkeley && { resizeMode: 'contain' }
                            ]}
                            onError={() => {
                              // Logo failed to load
                            }}
                          />
                        ) : (
                          <View style={[styles.experienceLogo, { backgroundColor: getFallbackColor(item.school || 'School'), justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                              {(item.school || 'S').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.experienceContent}>
                          <Text style={styles.experienceTitle}>{item.text}</Text>
                          <Text style={styles.experienceCompany}>{item.school}</Text>
                          {item.duration && (
                            <Text style={styles.experienceDuration}>{item.duration}</Text>
                          )}
                          {item.description && (
                            <Text style={styles.experienceDescription}>{item.description}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.placeholderText}>
                    Education data is not available with the current LinkedIn permissions.
                  </Text>
                )}
              </View>
            )}

            {/* Skills Section */}
            {(isLinkedInProfile || (completeProfileData?.skills && completeProfileData.skills.length > 0)) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                {completeProfileData?.skills && completeProfileData.skills.length > 0 ? (
                  <View style={styles.skillsContainer}>
                    {completeProfileData.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Skills data is not available with the current LinkedIn permissions.
                  </Text>
                )}
              </View>
            )}

        </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles (You can paste your existing styles here) ---
const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: { 
        marginTop: 10, 
        color: '#666' 
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
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#003262',
    },
    container: { 
        flex: 1,
        padding: 20,
    },
    linkedinPrompt: { 
        padding: 20, 
        backgroundColor: '#eef5ff', 
        marginBottom: 20, 
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    linkedinPromptText: { 
        textAlign: 'center', 
        marginBottom: 15, 
        color: '#333',
        fontSize: 14,
    },
    connectButton: { 
        backgroundColor: '#0077b5', 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 20 
    },
    connectButtonText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    profileHeader: { 
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileImageContainer: {
        marginRight: 20,
    },
    profileImage: { 
        width: 80, 
        height: 80, 
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: { 
        flex: 1,
        justifyContent: 'center',
    },
    nameText: { 
        fontSize: 24, 
        fontWeight: 'bold',
        color: '#003262',
        marginBottom: 4,
    },
    titleText: { 
        fontSize: 16, 
        color: '#666',
        marginBottom: 4,
    },
    locationText: { 
        fontSize: 14, 
        color: '#888',
        marginBottom: 4,
    },
    connectionsText: { 
        fontSize: 14, 
        color: '#005582',
    },
    section: { 
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold',
        color: '#003262',
        marginBottom: 15,
    },
    summaryText: { 
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    placeholderText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 10,
    },
    experienceCard: { 
        flexDirection: 'row',
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    experienceLogo: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    experienceContent: { 
        flex: 1,
    },
    experienceTitle: { 
        fontSize: 16, 
        fontWeight: 'bold',
        color: '#003262',
        marginBottom: 4,
    },
    experienceCompany: { 
        fontSize: 14, 
        color: '#666',
        marginBottom: 2,
    },
    experienceDuration: { 
        fontSize: 12, 
        color: '#888',
        marginBottom: 4,
    },
    experienceDescription: { 
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    cardContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    imagePlaceholder: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        marginRight: 15,
    },
    textInputPlaceholder: { 
        flex: 1,
    },
    cardText: { 
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    skillsContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap',
    },
    skillTag: { 
        backgroundColor: '#005582',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: { 
        color: '#fff', 
        fontSize: 12,
        fontWeight: '500',
    },
    urlInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      marginTop: 15,
      fontSize: 14,
    },
    rankText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#005582',
    },
});


export default ProfileScreen;