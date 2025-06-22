import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const CLAUDE_RESPONSES_KEY = 'claude_responses';
const USER_ANALYSIS_KEY = 'user_analysis';

// Store Claude response by type
export const storeUserAnalysis = async (analysisType, data) => {
  try {
    const timestamp = new Date().toISOString();
    const analysis = {
      type: analysisType,
      data: {
        ...data,
        timestamp: timestamp
      },
      timestamp: timestamp
    };

    // Get existing responses
    const existingResponses = await getClaudeResponsesByType(analysisType);
    existingResponses.push(analysis);

    // Store updated responses
    await AsyncStorage.setItem(
      `${CLAUDE_RESPONSES_KEY}_${analysisType}`, 
      JSON.stringify(existingResponses)
    );

    console.log(`✅ Stored ${analysisType} analysis with timestamp`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error storing analysis:', error);
    return { success: false, error: error.message };
  }
};

// Get Claude responses by type
export const getClaudeResponsesByType = async (analysisType) => {
  try {
    const responses = await AsyncStorage.getItem(`${CLAUDE_RESPONSES_KEY}_${analysisType}`);
    return responses ? JSON.parse(responses) : [];
  } catch (error) {
    console.error('❌ Error getting Claude responses:', error);
    return [];
  }
};

// Get all Claude responses
export const getAllClaudeResponses = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const claudeKeys = keys.filter(key => key.startsWith(CLAUDE_RESPONSES_KEY));
    
    const responses = {};
    for (const key of claudeKeys) {
      const type = key.replace(`${CLAUDE_RESPONSES_KEY}_`, '');
      responses[type] = await getClaudeResponsesByType(type);
    }
    
    return responses;
  } catch (error) {
    console.error('❌ Error getting all Claude responses:', error);
    return {};
  }
};

// Clear Claude responses
export const clearClaudeResponses = async (analysisType = null) => {
  try {
    if (analysisType) {
      await AsyncStorage.removeItem(`${CLAUDE_RESPONSES_KEY}_${analysisType}`);
      console.log(`✅ Cleared ${analysisType} responses`);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const claudeKeys = keys.filter(key => key.startsWith(CLAUDE_RESPONSES_KEY));
      await AsyncStorage.multiRemove(claudeKeys);
      console.log('✅ Cleared all Claude responses');
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing Claude responses:', error);
    return { success: false, error: error.message };
  }
};

// Store user analysis data
export const storeUserAnalysisData = async (userData) => {
  try {
    const timestamp = new Date().toISOString();
    const analysisData = {
      userData: userData,
      timestamp: timestamp
    };

    await AsyncStorage.setItem(USER_ANALYSIS_KEY, JSON.stringify(analysisData));
    console.log('✅ Stored user analysis data');
    return { success: true };
  } catch (error) {
    console.error('❌ Error storing user analysis data:', error);
    return { success: false, error: error.message };
  }
};

// Get user analysis data
export const getUserAnalysisData = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_ANALYSIS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error getting user analysis data:', error);
    return null;
  }
};

// Create preview version of Claude analysis for UI display
export const createAnalysisPreview = (analysisData) => {
  if (!analysisData || !analysisData.success) {
    return {
      type: 'error',
      preview: 'Analysis failed',
      timestamp: new Date().toISOString()
    };
  }

  if (analysisData.ranking && analysisData.ranking.rankings) {
    // Ranking preview
    const rankings = analysisData.ranking.rankings;
    const top3 = rankings.slice(0, 3);
    const preview = `Top 3: ${top3.map(r => r.name).join(', ')}`;
    
    return {
      type: 'ranking',
      preview: preview,
      fullData: analysisData,
      timestamp: analysisData.timestamp || new Date().toISOString(),
      count: rankings.length
    };
  }

  if (analysisData.insights) {
    // Insights preview - show first line only
    const firstLine = analysisData.insights.split('\n')[0];
    const preview = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    
    return {
      type: 'insights',
      preview: preview,
      fullData: analysisData,
      timestamp: analysisData.timestamp || new Date().toISOString()
    };
  }

  return {
    type: 'unknown',
    preview: 'Unknown analysis type',
    timestamp: new Date().toISOString()
  };
};

// Get previews of all Claude responses
export const getClaudeResponsePreviews = async () => {
  try {
    const allResponses = await getAllClaudeResponses();
    const previews = [];

    for (const [type, responses] of Object.entries(allResponses)) {
      for (const response of responses) {
        const preview = createAnalysisPreview(response.data);
        previews.push({
          id: `${type}_${response.timestamp}`,
          type: type,
          preview: preview,
          originalResponse: response
        });
      }
    }

    // Sort by timestamp (newest first)
    return previews.sort((a, b) => new Date(b.preview.timestamp) - new Date(a.preview.timestamp));
  } catch (error) {
    console.error('❌ Error getting Claude response previews:', error);
    return [];
  }
}; 