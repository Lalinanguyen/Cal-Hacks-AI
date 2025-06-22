import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const ClaudeAnalysisDetailScreen = ({ route, navigation }) => {
  const { analysisData, analysisType } = route.params;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderRankingDetails = () => {
    if (!analysisData.ranking || !analysisData.ranking.rankings) {
      return <Text style={styles.errorText}>No ranking data available</Text>;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>🏆 Student Rankings</Text>
        {analysisData.ranking.rankings.map((ranking, index) => (
          <View key={index} style={styles.rankingItem}>
            <View style={styles.rankingHeader}>
              <Text style={styles.rankNumber}>#{ranking.rank}</Text>
              <Text style={styles.studentName}>{ranking.name}</Text>
              <Text style={styles.score}>Score: {ranking.score}</Text>
            </View>
            <Text style={styles.reasoning}>{ranking.reasoning}</Text>
            <View style={styles.strengthsContainer}>
              <Text style={styles.strengthsLabel}>✅ Strengths:</Text>
              {ranking.strengths.map((strength, idx) => (
                <Text key={idx} style={styles.strengthItem}>• {strength}</Text>
              ))}
            </View>
            <View style={styles.improvementsContainer}>
              <Text style={styles.improvementsLabel}>💡 Areas for Improvement:</Text>
              {ranking.areas_for_improvement.map((area, idx) => (
                <Text key={idx} style={styles.improvementItem}>• {area}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderInsightsDetails = () => {
    if (!analysisData.insights) {
      return <Text style={styles.errorText}>No insights data available</Text>;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>🤖 Industry Insights</Text>
        <Text style={styles.insightsText}>{analysisData.insights}</Text>
      </View>
    );
  };

  const renderRawResponse = () => {
    if (!analysisData.rawResponse) {
      return null;
    }

    return (
      <View style={styles.rawResponseContainer}>
        <Text style={styles.sectionTitle}>📄 Raw Response</Text>
        <Text style={styles.rawResponseText}>{analysisData.rawResponse}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Entypo name="chevron-left" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {analysisType === 'ranking' ? '🏆 Ranking Details' : '🤖 Insights Details'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>
            Analyzed: {formatTimestamp(analysisData.timestamp || new Date().toISOString())}
          </Text>
        </View>

        {analysisType === 'ranking' ? renderRankingDetails() : renderInsightsDetails()}
        
        {renderRawResponse()}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
  },
  headerSpacer: {
    width: 24,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  timestampContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 16,
  },
  rankingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  score: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reasoning: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  strengthsContainer: {
    marginBottom: 8,
  },
  strengthsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  strengthItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    lineHeight: 18,
  },
  improvementsContainer: {
    marginBottom: 8,
  },
  improvementsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffc107',
    marginBottom: 4,
  },
  improvementItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    lineHeight: 18,
  },
  insightsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rawResponseContainer: {
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rawResponseText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ClaudeAnalysisDetailScreen; 