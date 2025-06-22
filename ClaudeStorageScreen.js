import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { getClaudeResponsePreviews, clearClaudeResponses } from './claudeStorageService';

const AnalysisPreviewItem = ({ item, onPress }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'ranking': return '🏆';
      case 'insights': return '🤖';
      default: return '📊';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'ranking': return 'Ranking Analysis';
      case 'insights': return 'Industry Insights';
      default: return 'Analysis';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.previewItem} onPress={onPress}>
      <View style={styles.previewHeader}>
        <View style={styles.previewIconContainer}>
          <Text style={styles.previewIcon}>{getTypeIcon(item.type)}</Text>
        </View>
        <View style={styles.previewInfo}>
          <Text style={styles.previewType}>{getTypeLabel(item.type)}</Text>
          <Text style={styles.previewTime}>{formatTimestamp(item.preview.timestamp)}</Text>
        </View>
        <Entypo name="chevron-right" size={20} color="#ccc" />
      </View>
      
      <Text style={styles.previewText} numberOfLines={2}>
        {item.preview.preview}
      </Text>
      
      {item.preview.count && (
        <Text style={styles.previewCount}>
          {item.preview.count} students ranked
        </Text>
      )}
    </TouchableOpacity>
  );
};

const ClaudeStorageScreen = ({ navigation }) => {
  const [analysisPreviews, setAnalysisPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisPreviews();
  }, []);

  const loadAnalysisPreviews = async () => {
    try {
      setLoading(true);
      const previews = await getClaudeResponsePreviews();
      setAnalysisPreviews(previews);
    } catch (error) {
      console.error('Error loading analysis previews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPress = (item) => {
    navigation.navigate('ClaudeAnalysisDetail', {
      analysisData: item.preview.fullData,
      analysisType: item.type
    });
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Analysis',
      'Are you sure you want to delete all Claude analysis results? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearClaudeResponses();
              setAnalysisPreviews([]);
              Alert.alert('Success', 'All analysis results have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear analysis results.');
            }
          }
        }
      ]
    );
  };

  const getGroupedPreviews = () => {
    const grouped = {};
    analysisPreviews.forEach(item => {
      const date = new Date(item.preview.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Claude Analysis History</Text>
          <Text style={styles.headerSubtitle}>
            {analysisPreviews.length} analysis results
          </Text>
        </View>
        {analysisPreviews.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Entypo name="trash" size={20} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analysis history...</Text>
          </View>
        ) : analysisPreviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyTitle}>No Analysis History</Text>
            <Text style={styles.emptyText}>
              Your Claude analysis results will appear here after you run analysis on the leaderboard.
            </Text>
          </View>
        ) : (
          Object.entries(getGroupedPreviews()).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {items.map((item, index) => (
                <AnalysisPreviewItem
                  key={item.id}
                  item={item}
                  onPress={() => handlePreviewPress(item)}
                />
              ))}
            </View>
          ))
        )}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  previewItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewIcon: {
    fontSize: 20,
  },
  previewInfo: {
    flex: 1,
  },
  previewType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  previewTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  previewText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  previewCount: {
    fontSize: 12,
    color: '#005582',
    fontWeight: '500',
  },
});

export default ClaudeStorageScreen; 