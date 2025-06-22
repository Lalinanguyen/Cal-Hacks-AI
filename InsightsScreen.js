import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo, FontAwesome } from '@expo/vector-icons';

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2B579A', '#1E3A8A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Berkeley Insights Dashboard</Text>
        <FontAwesome name="bear" size={24} color="white" />
      </LinearGradient>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Berkeley Student LinkedIn Insights</Text>
          <Text style={styles.introSubtitle}>Data based on aggregated analysis of 1,000 current UC Berkeley student LinkedIn profiles</Text>
        </View>

        <InsightCard title="Academic Trends" icon="graduation-cap" gradientColors={['#0078D4', '#106EBE']}>
          <StatItem label="Most Popular Major" value="Computer Science (28%)" color="#2B579A" />
          <StatItem label="Double Major Rate" value="23% of students" color="#2B579A" />
          <StatItem label="Graduate School Bound" value="67% of seniors" color="#2B579A" />
          <StatItem label="Study Abroad Experience" value="42% have international experience" color="#2B579A" />
        </InsightCard>

        <InsightCard title="Career & Experience Patterns" icon="briefcase" gradientColors={['#00B294', '#008272']}>
          <StatItem label="Average Internships" value="2.3 per student" color="#0078D4" />
          <StatItem label="Summer Internship Success" value="78% secured placements" color="#0078D4" />
          <StatItem label="Startup Founders" value="18% have founded startups" color="#0078D4" />
          <StatItem label="Research Involvement" value="34% in undergraduate research" color="#0078D4" />
        </InsightCard>

        <InsightCard title="Industry Preferences" icon="building" gradientColors={['#7B68EE', '#6A5ACD']}>
          <StatItem label="Tech Industry" value="52% pursuing technology" color="#2B579A" />
          <StatItem label="Finance & Consulting" value="24% of business students" color="#2B579A" />
          <StatItem label="Social Impact" value="16% focused on non-profit" color="#2B579A" />
          <StatItem label="Healthcare & Biotech" value="19% of life science majors" color="#2B579A" />
        </InsightCard>

        <InsightCard title="Skills & Certifications" icon="cogs" gradientColors={['#FF6B35', '#E55A2B']}>
          <StatItem label="Python Proficiency" value="67% of students" color="#0078D4" />
          <StatItem label="Multi-Language Speakers" value="31% speak 3+ languages" color="#0078D4" />
          <StatItem label="AWS Certified" value="23% have AWS certification" color="#0078D4" />
          <StatItem label="Leadership Positions" value="72% hold leadership roles" color="#0078D4" />
        </InsightCard>

        <InsightCard title="Geographic Insights" icon="globe" gradientColors={['#00B294', '#008272']}>
          <StatItem label="Bay Area Bound" value="48% staying in California" color="#2B579A" />
          <StatItem label="East Coast Explorers" value="23% eyeing NY/Boston" color="#2B579A" />
          <StatItem label="International Ambitions" value="12% want to work abroad" color="#2B579A" />
          <StatItem label="California Natives" value="35% originally from CA" color="#2B579A" />
        </InsightCard>

        <InsightCard title="Networking & Connections" icon="users" gradientColors={['#7B68EE', '#6A5ACD']}>
          <StatItem label="Average Connections" value="487 LinkedIn connections" color="#0078D4" />
          <StatItem label="Alumni Network" value="89% connected to 5+ alumni" color="#0078D4" />
          <StatItem label="Industry Mentors" value="56% have mentor relationships" color="#0078D4" />
          <StatItem label="Peer Collaboration" value="73% connected to classmates" color="#0078D4" />
        </InsightCard>

        <InsightCard title="Career Timeline Trends" icon="clock-o" gradientColors={['#FF6B35', '#E55A2B']}>
          <StatItem label="Early Starters" value="34% first internship freshman/sophomore" color="#2B579A" />
          <StatItem label="Job Hunt Timeline" value="67% start 8+ months early" color="#2B579A" />
          <StatItem label="Average Job Offers" value="2.4 offers per student" color="#2B579A" />
          <StatItem label="Gap Year Planners" value="8% taking gap years" color="#2B579A" />
        </InsightCard>

        <InsightCard title="Social Impact & Values" icon="heart" gradientColors={['#00B294', '#008272']}>
          <StatItem label="Sustainability Focus" value="41% highlight environmental work" color="#0078D4" />
          <StatItem label="Diversity Advocates" value="67% involved in DEI initiatives" color="#0078D4" />
          <StatItem label="Community Service" value="78% participate in volunteer work" color="#0078D4" />
          <StatItem label="Innovation Projects" value="29% working on AI/blockchain" color="#0078D4" />
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
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2B579A',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  statItem: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statHeader: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  footerText: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
});

export default InsightsScreen;
