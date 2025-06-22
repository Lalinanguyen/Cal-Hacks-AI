import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getCleanedData } from './cleaning.js';

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

const OtherProfileScreen = ({ navigation, route }) => {
  const { profile } = route.params;

  // Convert leaderboard data to profile format
  const convertToProfileFormat = (leaderboardProfile) => {
    if (!leaderboardProfile) return null;
    
    // Get total number of students for rank display
    let totalStudents = 0;
    // Note: getCleanedData is async, so we'll need to handle this differently
    // For now, we'll use a reasonable estimate or get it from the profile data
    
    // Generate education based on major and graduation year
    const generateEducation = () => {
      if (leaderboardProfile.Education) {
        try {
          const parsedEducation = JSON.parse(leaderboardProfile.Education);
          if (Array.isArray(parsedEducation)) {
            return parsedEducation.map((edu, index) => ({
              id: index + 1,
              logo: edu.logo || null,
              text: edu.text || edu.degree || 'Degree',
              school: edu.school || edu.institution || 'School',
              duration: edu.duration || '',
              description: edu.description || '',
              // Generate placeholder image if no logo
              placeholderImage: !edu.logo ? {
                backgroundColor: getFallbackColor(edu.school || edu.institution || 'School'),
                text: (edu.school || edu.institution || 'S').charAt(0).toUpperCase()
              } : null
            }));
          } else if (typeof parsedEducation === 'object') {
            return [{
              id: 1,
              logo: parsedEducation.logo || null,
              text: parsedEducation.text || parsedEducation.degree || 'Degree',
              school: parsedEducation.school || parsedEducation.institution || 'School',
              duration: parsedEducation.duration || '',
              description: parsedEducation.description || '',
              // Generate placeholder image if no logo
              placeholderImage: !parsedEducation.logo ? {
                backgroundColor: getFallbackColor(parsedEducation.school || parsedEducation.institution || 'School'),
                text: (parsedEducation.school || parsedEducation.institution || 'S').charAt(0).toUpperCase()
              } : null
            }];
          }
        } catch (e) {
          console.log(`⚠️ Could not parse Education JSON for ${leaderboardProfile.Name}:`, e.message);
        }
      }
      
      // Fallback to basic education entry
      return [{
        id: 1,
        logo: null,
        text: 'B.S. in Computer Science',
        school: 'UC Berkeley',
        duration: 'Expected 2025',
        description: 'Focus on software engineering and algorithms',
        // Generate placeholder image
        placeholderImage: {
          backgroundColor: getFallbackColor('UC Berkeley'),
          text: 'U'
        }
      }];
    };

    // Parse experience JSON if it exists
    let experience = [];
    let aboutText = '';
    
    // First, try to use the pre-parsed experience data from cleaning
    if (leaderboardProfile.experienceData && Array.isArray(leaderboardProfile.experienceData)) {
      experience = leaderboardProfile.experienceData.map((exp, index) => ({
        id: index + 1,
        logo: exp.company_logo || null, // Use company logo from 7th column
        text: exp.title || exp.position || exp.role || exp.text || exp.company || 'Unknown Position',
        company: exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || '',
        duration: exp.start_date ? new Date(exp.start_date).getFullYear() + (exp.end_date && exp.end_date !== 'Present' ? ' - ' + new Date(exp.end_date).getFullYear() : ' - Present') : exp.duration || '',
        description: exp.description || exp.desc || exp.summary || exp.responsibilities || exp.achievements || exp.details || '',
        // Generate placeholder image if no logo
        placeholderImage: !exp.company_logo ? {
          backgroundColor: getFallbackColor(exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'Company'),
          text: (exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'C').charAt(0).toUpperCase()
        } : null
      }));
    } else if (leaderboardProfile.Experience) {
      try {
        // Try to parse as JSON first
        const parsedExperience = JSON.parse(leaderboardProfile.Experience);
        
        // Extract About section if it exists
        if (parsedExperience.about || parsedExperience.About || parsedExperience.summary || parsedExperience.Summary) {
          aboutText = parsedExperience.about || parsedExperience.About || parsedExperience.summary || parsedExperience.Summary;
        }
        
        // Handle experience array
        if (Array.isArray(parsedExperience)) {
          experience = parsedExperience.map((exp, index) => ({
            id: index + 1,
            logo: exp.company_logo || null, // Use company logo from 7th column
            text: exp.title || exp.position || exp.role || exp.text || exp.company || 'Unknown Position',
            company: exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || '',
            duration: exp.start_date ? new Date(exp.start_date).getFullYear() + (exp.end_date && exp.end_date !== 'Present' ? ' - ' + new Date(exp.end_date).getFullYear() : ' - Present') : exp.duration || exp.timePeriod || exp.period || exp.dateRange || exp.employmentPeriod || '',
            description: exp.description || exp.desc || exp.summary || exp.responsibilities || exp.achievements || exp.details || '',
            // Generate placeholder image if no logo
            placeholderImage: !exp.company_logo ? {
              backgroundColor: getFallbackColor(exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'Company'),
              text: (exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'C').charAt(0).toUpperCase()
            } : null
          }));
        } else if (typeof parsedExperience === 'object') {
          // Check if it's an experience object or contains experience array
          if (parsedExperience.experience && Array.isArray(parsedExperience.experience)) {
            experience = parsedExperience.experience.map((exp, index) => ({
              id: index + 1,
              logo: exp.company_logo || null, // Use company logo from 7th column
              text: exp.title || exp.position || exp.role || exp.text || exp.company || 'Unknown Position',
              company: exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || '',
              duration: exp.start_date ? new Date(exp.start_date).getFullYear() + (exp.end_date && exp.end_date !== 'Present' ? ' - ' + new Date(exp.end_date).getFullYear() : ' - Present') : exp.duration || exp.timePeriod || exp.period || exp.dateRange || exp.employmentPeriod || '',
              description: exp.description || exp.desc || exp.summary || exp.responsibilities || exp.achievements || exp.details || '',
              // Generate placeholder image if no logo
              placeholderImage: !exp.company_logo ? {
                backgroundColor: getFallbackColor(exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'Company'),
                text: (exp.company_name || exp.company || exp.organization || exp.text?.split(' at ')[1] || exp.employer || 'C').charAt(0).toUpperCase()
              } : null
            }));
          } else if (parsedExperience.title || parsedExperience.position || parsedExperience.company) {
            // Single experience object
            experience = [{
              id: 1,
              logo: parsedExperience.company_logo || null, // Use company logo from 7th column
              text: parsedExperience.title || parsedExperience.position || parsedExperience.role || parsedExperience.company || 'Unknown Position',
              company: parsedExperience.company_name || parsedExperience.company || parsedExperience.organization || parsedExperience.employer || '',
              duration: parsedExperience.start_date ? new Date(parsedExperience.start_date).getFullYear() + (parsedExperience.end_date && parsedExperience.end_date !== 'Present' ? ' - ' + new Date(parsedExperience.end_date).getFullYear() : ' - Present') : parsedExperience.duration || parsedExperience.timePeriod || parsedExperience.period || parsedExperience.dateRange || parsedExperience.employmentPeriod || '',
              description: parsedExperience.description || parsedExperience.desc || parsedExperience.summary || parsedExperience.responsibilities || parsedExperience.achievements || parsedExperience.details || '',
              // Generate placeholder image if no logo
              placeholderImage: !parsedExperience.company_logo ? {
                backgroundColor: getFallbackColor(parsedExperience.company_name || parsedExperience.company || parsedExperience.organization || parsedExperience.employer || 'Company'),
                text: (parsedExperience.company_name || parsedExperience.company || parsedExperience.organization || parsedExperience.employer || 'C').charAt(0).toUpperCase()
              } : null
            }];
          }
        }
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated string
        const experienceArray = leaderboardProfile.Experience.split(', ').filter(exp => exp.trim());
        experience = experienceArray.map((exp, index) => ({
          id: index + 1,
          logo: null,
          text: exp.trim(),
          company: exp.trim(),
          duration: '',
          description: '',
          // Generate placeholder image if no logo
          placeholderImage: {
            backgroundColor: getFallbackColor(exp.trim()),
            text: exp.trim().charAt(0).toUpperCase()
          }
        }));
      }
    }
    
    // If no experience parsed, use company as fallback
    if (experience.length === 0 && leaderboardProfile.Company) {
      experience = [{
        id: 1,
        logo: null,
        text: leaderboardProfile.Title || 'Professional',
        company: leaderboardProfile.Company,
        duration: '',
        description: '',
        // Generate placeholder image if no logo
        placeholderImage: {
          backgroundColor: getFallbackColor(leaderboardProfile.Company),
          text: leaderboardProfile.Company.charAt(0).toUpperCase()
        }
      }];
    }
    
    // Parse education data if it exists
    let education = generateEducation();
    
    // Generate a more detailed about section based on available data
    const generateAboutSection = () => {
      if (aboutText) return aboutText;
      
      const name = leaderboardProfile.Name || 'This student';
      const title = leaderboardProfile.Title || 'professional';
      const company = leaderboardProfile.Company || 'various companies';
      const major = leaderboardProfile.Major || 'Computer Science';
      const skills = leaderboardProfile.Skills || '';
      const connections = leaderboardProfile.LinkedInConnections || 0;
      
      let about = `${name} is a talented ${title} with experience at ${company}. `;
      
      if (major) {
        about += `Currently pursuing a degree in ${major} at UC Berkeley, `;
      }
      
      if (skills) {
        const skillList = skills.split(',').slice(0, 3).join(', ');
        about += `${name} specializes in ${skillList}. `;
      }
      
      if (connections > 0) {
        about += `With ${connections} LinkedIn connections, ${name} has built a strong professional network. `;
      }
      
      about += `${name} is passionate about technology and innovation, always eager to learn new skills and contribute to meaningful projects.`;
      
      return about;
    };
    
    // Parse skills more intelligently
    const parseSkills = () => {
      if (!leaderboardProfile.Skills) return ['JavaScript', 'Python', 'React', 'Node.js'];
      
      const skills = leaderboardProfile.Skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      return skills.length > 0 ? skills : ['JavaScript', 'Python', 'React', 'Node.js'];
    };
    
    return {
      id: leaderboardProfile.id || 'other-profile',
      firstName: leaderboardProfile.Name ? leaderboardProfile.Name.split(' ')[0] : '',
      lastName: leaderboardProfile.Name ? leaderboardProfile.Name.split(' ').slice(1).join(' ') : '',
      name: leaderboardProfile.Name || 'Unknown User',
      title: leaderboardProfile.Title || '',
      headline: leaderboardProfile.Title || '',
      profilePicture: leaderboardProfile.ProfileImageURL || leaderboardProfile.image || '',
      email: leaderboardProfile.Email || '',
      industry: leaderboardProfile.Industry || 'Technology',
      location: leaderboardProfile.Location || 'UC Berkeley',
      summary: generateAboutSection(),
      experience: experience,
      education: education,
      skills: parseSkills(),
      connections: leaderboardProfile.LinkedInConnections || 0,
      graduationYear: leaderboardProfile.GraduationYear || '2025',
      rank: leaderboardProfile.Rank || 0,
    };
  };

  const profileData = convertToProfileFormat(profile);

  if (!profileData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Entypo name="arrow-left" size={24} color="#003262" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileData.name}'s Profile</Text>
        <View style={{ width: 24 }} />
      </View>
    
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: getFallbackColor(profileData.name) }]}>
              <Text style={styles.profileInitial}>
                {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{profileData.name}</Text>
            <Text style={styles.titleText}>{profileData.title}</Text>
            <Text style={styles.locationText}>{profileData.location}</Text>
            <Text style={styles.connectionsText}>📊 {profileData.connections} connections</Text>
            {profileData.rank && (
              <Text style={styles.rankText}>🥇 Rank: #{profileData.rank} out of ~500</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.summaryText}>{profileData.summary}</Text>
        </View>

        {profileData.experience && profileData.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profileData.experience.map((item) => (
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
            ))}
          </View>
        )}

        {profileData.education && profileData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profileData.education.map((item) => {
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
                        // School logo failed to load
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
            })}
          </View>
        )}

        {profileData.skills && profileData.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Profile data from Berkeley Leaderboard
          </Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003262',
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
  container: {
    flex: 1,
    padding: 20,
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
    marginBottom: 2,
  },
  rankText: {
    fontSize: 14,
    color: '#ffc107',
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default OtherProfileScreen; 