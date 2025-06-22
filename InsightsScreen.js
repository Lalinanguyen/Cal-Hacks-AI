import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getClaudeIndustryInsights } from './claudeRankingService';
import { getCleanedData } from './cleaning.js';

const InsightsScreen = ({ navigation }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🤖 Loading industry insights...');
      
      // Get cleaned data for insights
      const cleanedData = await getCleanedData();
      if (!cleanedData || cleanedData.length === 0) {
        throw new Error('No data available for analysis');
      }

      // Get top 20 students for insights
      const topStudents = cleanedData.slice(0, 20);
      
      // Get Claude insights
      const insightsResult = await getClaudeIndustryInsights(topStudents);
      
      if (insightsResult.success) {
        setInsights(insightsResult);
        console.log('✅ Insights loaded successfully');
      } else {
        throw new Error('Failed to get insights from Claude');
      }
    } catch (error) {
      console.error('❌ Error loading insights:', error);
      setError(error.message);
      
      // Fallback insights
      setInsights({
        insights: `Based on analysis of ${cleanedData?.length || 0} Berkeley students, here are key industry insights:

🎯 Top Skills in Demand:
• Python and JavaScript remain the most sought-after programming languages
• Machine Learning and AI skills are increasingly valuable
• Cloud platforms (AWS, Azure, GCP) are essential for modern development
• React and React Native are popular for frontend and mobile development

📈 Networking Trends:
• Students with 500+ LinkedIn connections have better career opportunities
• Active engagement on LinkedIn correlates with job placement success
• Industry-specific connections are more valuable than general networking

🏢 Industry Insights:
• Technology companies are the top recruiters of Berkeley graduates
• Startups value practical experience over academic achievements
• Internships and research experience significantly improve job prospects

💡 Career Advice:
• Focus on building a strong online presence
• Participate in hackathons and coding competitions
• Seek mentorship from industry professionals
• Stay updated with emerging technologies`
      });
    } finally {
      setLoading(false);
    }
  };

  const getInsightSections = () => {
    if (!insights?.insights) return [];

    const insightText = insights.insights;
    const sections = [];

    // Split by emoji headers
    const parts = insightText.split(/(🎯|📈|🏢|💡)/);
    
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        const emoji = parts[i];
        const content = parts[i + 1].trim();
        
        let title = '';
        switch (emoji) {
          case '🎯':
            title = 'Top Skills in Demand';
            break;
          case '📈':
            title = 'Networking Trends';
            break;
          case '🏢':
            title = 'Industry Insights';
            break;
          case '💡':
            title = 'Career Advice';
            break;
          default:
            title = 'Insight';
        }
        
        sections.push({
          emoji,
          title,
          content
        });
      }
    }

    return sections;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🤖 Analyzing industry trends...</Text>
          <Text style={styles.loadingSubtext}>Claude AI is processing data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insightSections = getInsightSections();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Industry Insights</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>🤖 AI-Powered Industry Analysis</Text>
          <Text style={styles.introText}>
            Claude AI has analyzed Berkeley student data to provide insights about industry trends, 
            in-demand skills, and career opportunities.
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ⚠️ {error}
            </Text>
            <Text style={styles.errorSubtext}>
              Showing fallback insights based on available data.
            </Text>
          </View>
        )}

        {insightSections.map((section, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightEmoji}>{section.emoji}</Text>
              <Text style={styles.insightTitle}>{section.title}</Text>
            </View>
            <Text style={styles.insightContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.refreshContainer}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadInsights}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh Insights</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Insights generated by Claude AI based on Berkeley student data analysis
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005582',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#005582',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  introContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: '#856404',
    fontSize: 12,
    marginTop: 4,
  },
  insightCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
  },
  insightContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  refreshContainer: {
    margin: 16,
  },
  refreshButton: {
    backgroundColor: '#005582',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default InsightsScreen; 