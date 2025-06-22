import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  getClaudeResponses,
  getClaudeResponsesByType,
  getStorageStats,
  exportClaudeResponses,
  clearClaudeStorage,
  storeUserAnalysis,
  sendMessageWithStorage,
} from './claudeStorageService';
import { getCleanedData } from './dataService';

const StorageItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.storageItem} onPress={() => onPress(item)}>
    <View style={styles.itemHeader}>
      <Text style={styles.itemType}>{item.type}</Text>
      <Text style={styles.itemTimestamp}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
    <Text style={styles.itemKey} numberOfLines={1}>
      {item.key}
    </Text>
    <Text style={styles.itemPreview} numberOfLines={2}>
      {typeof item.data === 'string' 
        ? item.data.slice(0, 100) + '...' 
        : JSON.stringify(item.data).slice(0, 100) + '...'
      }
    </Text>
  </TouchableOpacity>
);

const ClaudeStorageScreen = ({ navigation }) => {
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      const [allResponses, storageStats] = await Promise.all([
        getClaudeResponses(),
        getStorageStats(),
      ]);
      
      setResponses(allResponses);
      setStats(storageStats);
    } catch (error) {
      console.error('Error loading storage data:', error);
      Alert.alert('Error', 'Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
  };

  const filterResponses = () => {
    if (selectedType === 'all') return responses;
    return responses.filter(response => response.type === selectedType);
  };

  const handleExport = async () => {
    try {
      const filePath = await exportClaudeResponses();
      Alert.alert(
        'Export Successful',
        `Claude responses exported to:\n${filePath}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'Are you sure you want to clear all stored Claude responses? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearClaudeStorage();
              await loadStorageData();
              Alert.alert('Success', 'All Claude storage cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear storage');
            }
          },
        },
      ]
    );
  };

  const handleGenerateTestData = async () => {
    try {
      setLoading(true);
      
      // Generate test analysis
      const userData = await getCleanedData();
      if (userData && userData.length > 0) {
        await storeUserAnalysis(userData.slice(0, 5));
      }

      // Generate test conversation
      await sendMessageWithStorage(
        'Hello Claude! Can you help me understand my data?',
        'You are a helpful data analyst.',
        'test_conversation_1'
      );

      await loadStorageData();
      Alert.alert('Success', 'Test data generated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate test data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    Alert.alert(
      `Claude Response - ${item.type}`,
      typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2),
      [
        { text: 'Copy', onPress: () => console.log('Copy functionality') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const renderTypeFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'user_analysis', 'recommendations', 'conversation', 'general'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedType === type && styles.filterButtonTextActive,
            ]}>
              {type.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005582" />
          <Text style={styles.loadingText}>Loading Claude storage...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredResponses = filterResponses();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Entypo name="dots-three-vertical" size={24} color="#005582" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claude Storage</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#005582" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
        {/* Stats Section */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>📊 Storage Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalResponses}</Text>
                <Text style={styles.statLabel}>Total Responses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalConversations}</Text>
                <Text style={styles.statLabel}>Conversations</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(stats.totalStorageSize / 1024).toFixed(1)} KB
                </Text>
                <Text style={styles.statLabel}>Storage Size</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGenerateTestData}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Generate Test Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
            <MaterialIcons name="file-download" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearButton]} 
            onPress={handleClearStorage}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Clear Storage</Text>
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        {renderTypeFilter()}

        {/* Responses List */}
        <View style={styles.responsesContainer}>
          <Text style={styles.sectionTitle}>
            Claude Responses ({filteredResponses.length})
          </Text>
          
          {filteredResponses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="storage" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No Claude responses stored</Text>
              <Text style={styles.emptySubtext}>
                Generate some test data or use Claude features to see responses here
              </Text>
            </View>
          ) : (
            filteredResponses.map((item, index) => (
              <StorageItem
                key={item.id || index}
                item={item}
                onPress={handleItemPress}
              />
            ))
          )}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005582',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005582',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005582',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005582',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#005582',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  responsesContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  storageItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#005582',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  itemKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPreview: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default ClaudeStorageScreen; 