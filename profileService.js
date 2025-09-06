import { getStoredLinkedInProfile, getLinkedInProfile } from './linkedinService';

// Shared profile state
let currentProfile = null;
let profileListeners = [];

// Mock profile data as fallback
const mockProfile = {
  id: 'mock-profile-id',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  title: 'Software Engineer at Berkeley',
  headline: 'Software Engineer at Berkeley',
  profilePicture: null,
  secondaryPicture: null,
  connectionsPicture: null,
  email: 'john.doe@berkeley.edu',
  industry: 'Technology',
  location: 'San Francisco Bay Area',
  summary: 'Passionate software engineer with experience in React Native, Python, and machine learning. Currently studying Computer Science at UC Berkeley and working on innovative mobile applications.',
  experience: [
    { id: 1, logo: null, text: 'Software Engineer Intern at Google' },
    { id: 2, logo: null, text: 'Full Stack Developer at Berkeley Startup' },
    { id: 3, logo: null, text: 'Research Assistant at UC Berkeley' },
  ],
  education: [
    { id: 1, logo: null, text: 'B.S. in Computer Science at UC Berkeley' },
    { id: 2, logo: null, text: 'High School Diploma at Berkeley High' },
  ],
  skills: ['React Native', 'Python', 'JavaScript', 'Machine Learning', 'Node.js', 'AWS', 'Git'],
  connections: 450,
  fetchedAt: new Date().toISOString()
};

// Load profile data
export const loadProfileData = async () => {
  try {
    console.log('Loading profile data...');
    
    // First try to get stored profile data
    const storedResult = await getStoredLinkedInProfile();
    
    if (storedResult.success && storedResult.profile) {
      console.log('Found stored LinkedIn profile');
      currentProfile = storedResult.profile;
    } else {
      console.log('No stored profile found, using mock profile data');
      currentProfile = mockProfile;
    }
    
    // Notify all listeners
    notifyProfileListeners();
    
    return { success: true, profile: currentProfile };
  } catch (error) {
    console.error('Error loading profile data:', error);
    currentProfile = mockProfile;
    notifyProfileListeners();
    return { success: false, error: error.message, profile: currentProfile };
  }
};

// Get current profile
export const getCurrentProfile = () => {
  return currentProfile;
};

// Update profile data
export const updateProfile = (newProfile) => {
  currentProfile = newProfile;
  notifyProfileListeners();
};

// Refresh profile from LinkedIn
export const refreshProfile = async () => {
  try {
    console.log('Refreshing LinkedIn profile...');
    
    const result = await getLinkedInProfile();
    
    if (result.success) {
      console.log('Successfully refreshed LinkedIn profile');
      currentProfile = result.profile;
      notifyProfileListeners();
      return { success: true, profile: currentProfile };
    } else {
      console.log('Failed to refresh profile:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error refreshing profile:', error);
    return { success: false, error: error.message };
  }
};

// Connect to LinkedIn
export const connectLinkedIn = async () => {
  try {
    console.log('🔗 Connecting to LinkedIn...');
    
    const result = await getLinkedInProfile();
    
    if (result.success) {
      console.log('LinkedIn connection successful!');
      currentProfile = result.profile;
      notifyProfileListeners();
      return { success: true, profile: currentProfile };
    } else {
      console.log('LinkedIn connection failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error connecting to LinkedIn:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to profile changes
export const subscribeToProfile = (listener) => {
  profileListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = profileListeners.indexOf(listener);
    if (index > -1) {
      profileListeners.splice(index, 1);
    }
  };
};

// Notify all listeners of profile changes
const notifyProfileListeners = () => {
  profileListeners.forEach(listener => {
    try {
      listener(currentProfile);
    } catch (error) {
      console.error('Error in profile listener:', error);
    }
  });
};

// Initialize profile on module load
loadProfileData(); 
