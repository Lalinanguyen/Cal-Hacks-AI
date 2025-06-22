import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { sendMessageToClaude, analyzeUserData, generateRecommendations } from './claudeAPI';

/**
 * Claude Storage Service
 * Handles storing and retrieving Claude API responses
 */

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  CLAUDE_RESPONSES: 'claude_responses',
  USER_ANALYSES: 'user_analyses',
  RECOMMENDATIONS: 'recommendations',
  CONVERSATION_HISTORY: 'conversation_history',
  CACHE_TIMESTAMP: 'cache_timestamp',
};

/**
 * Store Claude response in AsyncStorage
 * @param {string} key - Storage key
 * @param {Object} data - Data to store
 * @param {string} type - Type of response (analysis, recommendation, etc.)
 */
export const storeClaudeResponse = async (key, data, type = 'general') => {
  try {
    const timestamp = new Date().toISOString();
    const responseData = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      timestamp,
      key,
    };

    // Get existing responses
    const existingResponses = await getClaudeResponses();
    existingResponses.push(responseData);

    // Store updated responses
    await AsyncStorage.setItem(STORAGE_KEYS.CLAUDE_RESPONSES, JSON.stringify(existingResponses));
    
    console.log(`✅ Claude response stored: ${type} - ${key}`);
    return responseData;
  } catch (error) {
    console.error('❌ Error storing Claude response:', error);
    throw error;
  }
};

/**
 * Get all stored Claude responses
 * @returns {Array} Array of stored responses
 */
export const getClaudeResponses = async () => {
  try {
    const responses = await AsyncStorage.getItem(STORAGE_KEYS.CLAUDE_RESPONSES);
    return responses ? JSON.parse(responses) : [];
  } catch (error) {
    console.error('❌ Error getting Claude responses:', error);
    return [];
  }
};

/**
 * Get Claude responses by type
 * @param {string} type - Type of responses to retrieve
 * @returns {Array} Filtered responses
 */
export const getClaudeResponsesByType = async (type) => {
  try {
    const allResponses = await getClaudeResponses();
    return allResponses.filter(response => response.type === type);
  } catch (error) {
    console.error('❌ Error getting Claude responses by type:', error);
    return [];
  }
};

/**
 * Store user analysis with caching
 * @param {Array} userData - User data to analyze
 * @param {boolean} forceRefresh - Force new analysis even if cached
 * @returns {Promise<Object>} Analysis result with storage info
 */
export const storeUserAnalysis = async (userData, forceRefresh = false) => {
  try {
    const cacheKey = `analysis_${JSON.stringify(userData).slice(0, 100)}`;
    
    // Check if we have a recent cached analysis
    if (!forceRefresh) {
      const cachedAnalysis = await getClaudeResponsesByType('user_analysis');
      const recentAnalysis = cachedAnalysis.find(analysis => 
        analysis.key === cacheKey && 
        new Date(analysis.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
      );
      
      if (recentAnalysis) {
        console.log('📋 Using cached user analysis');
        return recentAnalysis;
      }
    }

    // Get new analysis from Claude
    console.log('🤖 Getting fresh user analysis from Claude...');
    const analysis = await analyzeUserData(userData);
    
    // Store the analysis
    const storedAnalysis = await storeClaudeResponse(cacheKey, analysis, 'user_analysis');
    
    return storedAnalysis;
  } catch (error) {
    console.error('❌ Error storing user analysis:', error);
    throw error;
  }
};

/**
 * Store personalized recommendations
 * @param {Object} userProfile - User profile
 * @param {Array} userHistory - User history
 * @param {boolean} forceRefresh - Force new recommendations
 * @returns {Promise<Object>} Recommendations with storage info
 */
export const storeRecommendations = async (userProfile, userHistory, forceRefresh = false) => {
  try {
    const cacheKey = `recommendations_${userProfile.id || userProfile.Name}_${Date.now()}`;
    
    // Check for recent cached recommendations
    if (!forceRefresh) {
      const cachedRecommendations = await getClaudeResponsesByType('recommendations');
      const recentRecommendations = cachedRecommendations.find(rec => 
        rec.key.includes(userProfile.id || userProfile.Name) &&
        new Date(rec.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
      );
      
      if (recentRecommendations) {
        console.log('📋 Using cached recommendations');
        return recentRecommendations;
      }
    }

    // Get new recommendations from Claude
    console.log('🤖 Getting fresh recommendations from Claude...');
    const recommendations = await generateRecommendations(userProfile, userHistory);
    
    // Store the recommendations
    const storedRecommendations = await storeClaudeResponse(cacheKey, recommendations, 'recommendations');
    
    return storedRecommendations;
  } catch (error) {
    console.error('❌ Error storing recommendations:', error);
    throw error;
  }
};

/**
 * Store conversation history
 * @param {string} conversationId - Unique conversation ID
 * @param {Array} messages - Array of messages
 */
export const storeConversationHistory = async (conversationId, messages) => {
  try {
    const conversation = {
      id: conversationId,
      messages,
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
    };

    const existingConversations = await getConversationHistory();
    const updatedConversations = existingConversations.filter(conv => conv.id !== conversationId);
    updatedConversations.push(conversation);

    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(updatedConversations));
    console.log(`✅ Conversation history stored: ${conversationId}`);
  } catch (error) {
    console.error('❌ Error storing conversation history:', error);
    throw error;
  }
};

/**
 * Get conversation history
 * @returns {Array} Array of conversations
 */
export const getConversationHistory = async () => {
  try {
    const conversations = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error('❌ Error getting conversation history:', error);
    return [];
  }
};

/**
 * Export Claude responses to file
 * @param {string} filename - Name of the file
 * @returns {Promise<string>} File path
 */
export const exportClaudeResponses = async (filename = 'claude_responses.json') => {
  try {
    const responses = await getClaudeResponses();
    const conversations = await getConversationHistory();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalResponses: responses.length,
      totalConversations: conversations.length,
      responses,
      conversations,
    };

    const filePath = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Claude responses exported to: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('❌ Error exporting Claude responses:', error);
    throw error;
  }
};

/**
 * Clear all stored Claude data
 */
export const clearClaudeStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CLAUDE_RESPONSES,
      STORAGE_KEYS.USER_ANALYSES,
      STORAGE_KEYS.RECOMMENDATIONS,
      STORAGE_KEYS.CONVERSATION_HISTORY,
      STORAGE_KEYS.CACHE_TIMESTAMP,
    ]);
    
    console.log('🗑️ All Claude storage cleared');
  } catch (error) {
    console.error('❌ Error clearing Claude storage:', error);
    throw error;
  }
};

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage statistics
 */
export const getStorageStats = async () => {
  try {
    const responses = await getClaudeResponses();
    const conversations = await getConversationHistory();
    
    const stats = {
      totalResponses: responses.length,
      totalConversations: conversations.length,
      responseTypes: {},
      oldestResponse: null,
      newestResponse: null,
      totalStorageSize: 0,
    };

    // Calculate response types
    responses.forEach(response => {
      stats.responseTypes[response.type] = (stats.responseTypes[response.type] || 0) + 1;
    });

    // Find oldest and newest responses
    if (responses.length > 0) {
      const sortedResponses = responses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      stats.oldestResponse = sortedResponses[0].timestamp;
      stats.newestResponse = sortedResponses[sortedResponses.length - 1].timestamp;
    }

    // Estimate storage size
    stats.totalStorageSize = JSON.stringify(responses).length + JSON.stringify(conversations).length;

    return stats;
  } catch (error) {
    console.error('❌ Error getting storage stats:', error);
    return null;
  }
};

/**
 * Enhanced Claude message with storage
 * @param {string} message - Message to send
 * @param {string} systemPrompt - System prompt
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<Object>} Response with storage info
 */
export const sendMessageWithStorage = async (message, systemPrompt = 'You are a helpful AI assistant.', conversationId = null) => {
  try {
    // Send message to Claude
    const response = await sendMessageToClaude(message, systemPrompt);
    
    // Store the response
    const storedResponse = await storeClaudeResponse(
      `message_${Date.now()}`,
      { message, response, systemPrompt },
      'conversation'
    );

    // If conversation ID provided, store in conversation history
    if (conversationId) {
      const conversations = await getConversationHistory();
      const existingConversation = conversations.find(conv => conv.id === conversationId);
      
      const newMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      if (existingConversation) {
        existingConversation.messages.push(newMessage, assistantMessage);
        existingConversation.messageCount += 2;
        await storeConversationHistory(conversationId, existingConversation.messages);
      } else {
        await storeConversationHistory(conversationId, [newMessage, assistantMessage]);
      }
    }

    return {
      response,
      storedResponse,
      conversationId,
    };
  } catch (error) {
    console.error('❌ Error in sendMessageWithStorage:', error);
    throw error;
  }
}; 