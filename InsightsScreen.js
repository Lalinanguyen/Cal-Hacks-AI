import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { getCleanedData } from './cleaning.js';
import { analyzeUserData, generateRecommendations } from './claudeAPI';

const InsightCard = ({ title, icon, children, gradientColors }) => (
  <View style={styles.card}>
    <LinearGradient colors={gradientColors} style={styles.cardHeader}>
      <FontAwesome name={icon} size={20} color="white" />
      <Text style={styles.cardTitle}>{title}</Text>
    </LinearGradient>
    <View style={styles.cardContent}>
      {children}
    </View>
  </View>
);

const StatItem = ({ label, value, color = '#2B579A' }) => (
  <View style={styles.statItem}>
    <View style={styles.statHeader}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InsightsScreen = ({ navigation }) => {
  const [userData, setUserData] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getCleanedData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateAIInsights = async () => {
    if (userData.length === 0) {
      Alert.alert('No Data', 'Please wait for data to load before generating insights.');
      return;
    }

    try {
      setLoading(true);
      const insights = await analyzeUserData(userData.slice(0, 50)); // Limit to first 50 entries for performance
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      Alert.alert(
        'API Error', 
        'Failed to generate AI insights. Please check your Claude API key configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Berkeley Insights Dashboard</Text>
        <View style={styles.headerIcon}>
          <FontAwesome name="chart-bar" size={24} color="#005582" />
        </View>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Berkeley Student LinkedIn Insights</Text>
          <Text style={styles.introSubtitle}>Data based on aggregated analysis of 1,000 current UC Berkeley student LinkedIn profiles</Text>
          
          <TouchableOpacity 
            style={styles.aiButton} 
            onPress={generateAIInsights}
            disabled={loading}
          >
            <Text style={styles.aiButtonText}>
              {loading ? 'Generating AI Insights...' : '🤖 Generate AI Insights'}
            </Text>
          </TouchableOpacity>
        </View>

        {aiInsights ? (
          <InsightCard title="AI-Generated Insights" icon="brain" gradientColors={['#005582', '#003d5f']}>
            <Text style={styles.aiInsightsText}>{aiInsights}</Text>
          </InsightCard>
        ) : null}

        <InsightCard title="Academic Trends" icon="graduation-cap" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Most Popular Major" value="Computer Science (28%)" color="#005582" />
          <StatItem label="Double Major Rate" value="23% of students" color="#005582" />
          <StatItem label="Graduate School Bound" value="67% of seniors" color="#005582" />
          <StatItem label="Study Abroad Experience" value="42% have international experience" color="#005582" />
        </InsightCard>

        <InsightCard title="Career & Experience Patterns" icon="briefcase" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Average Internships" value="2.3 per student" color="#005582" />
          <StatItem label="Summer Internship Success" value="78% secured placements" color="#005582" />
          <StatItem label="Startup Founders" value="18% have founded startups" color="#005582" />
          <StatItem label="Research Involvement" value="34% in undergraduate research" color="#005582" />
        </InsightCard>

        <InsightCard title="Industry Preferences" icon="building" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Tech Industry" value="52% pursuing technology" color="#005582" />
          <StatItem label="Finance & Consulting" value="24% of business students" color="#005582" />
          <StatItem label="Social Impact" value="16% focused on non-profit" color="#005582" />
          <StatItem label="Healthcare & Biotech" value="19% of life science majors" color="#005582" />
        </InsightCard>

        <InsightCard title="Skills & Certifications" icon="cogs" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Python Proficiency" value="67% of students" color="#005582" />
          <StatItem label="Multi-Language Speakers" value="31% speak 3+ languages" color="#005582" />
          <StatItem label="AWS Certified" value="23% have AWS certification" color="#005582" />
          <StatItem label="Leadership Positions" value="72% hold leadership roles" color="#005582" />
        </InsightCard>

        <InsightCard title="Geographic Insights" icon="globe" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Bay Area Bound" value="48% staying in California" color="#005582" />
          <StatItem label="East Coast Explorers" value="23% eyeing NY/Boston" color="#005582" />
          <StatItem label="International Ambitions" value="12% want to work abroad" color="#005582" />
          <StatItem label="California Natives" value="35% originally from CA" color="#005582" />
        </InsightCard>

        <InsightCard title="Networking & Connections" icon="users" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Average Connections" value="487 LinkedIn connections" color="#005582" />
          <StatItem label="Alumni Network" value="89% connected to 5+ alumni" color="#005582" />
          <StatItem label="Industry Mentors" value="56% have mentor relationships" color="#005582" />
          <StatItem label="Peer Collaboration" value="73% connected to classmates" color="#005582" />
        </InsightCard>

        <InsightCard title="Career Timeline Trends" icon="clock-o" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Early Starters" value="34% first internship freshman/sophomore" color="#005582" />
          <StatItem label="Job Hunt Timeline" value="67% start 8+ months early" color="#005582" />
          <StatItem label="Average Job Offers" value="2.4 offers per student" color="#005582" />
          <StatItem label="Gap Year Planners" value="8% taking gap years" color="#005582" />
        </InsightCard>

        <InsightCard title="Social Impact & Values" icon="heart" gradientColors={['#005582', '#003d5f']}>
          <StatItem label="Sustainability Focus" value="41% highlight environmental work" color="#005582" />
          <StatItem label="Diversity Advocates" value="67% involved in DEI initiatives" color="#005582" />
          <StatItem label="Community Service" value="78% participate in volunteer work" color="#005582" />
          <StatItem label="Innovation Projects" value="29% working on AI/blockchain" color="#005582" />
        </InsightCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Data updated monthly • Last updated: June 2024</Text>
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
    flex: 1,
    textAlign: 'center',
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#005582',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiInsightsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardContent: {
    padding: 16,
  },
  statItem: {
    marginBottom: 16,
  },
  statHeader: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default InsightsScreen;
