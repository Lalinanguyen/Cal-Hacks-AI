import { config } from './env.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Sends a message to Claude API
 * @param {string} message - The message to send to Claude
 * @param {string} systemPrompt - Optional system prompt
 * @returns {Promise<string>} The response from Claude
 */
export const sendMessageToClaude = async (message, systemPrompt = 'You are a helpful AI assistant.') => {
  try {
    const apiKey = config.CLAUDE_API_KEY;
    
    if (!apiKey || apiKey === 'your_fallback_key_here') {
      throw new Error('Claude API key not configured. Please check your .env file.');
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
};

/**
 * Analyzes user data and provides insights
 * @param {Array} userData - Array of user data objects
 * @returns {Promise<string>} Analysis from Claude
 */
export const analyzeUserData = async (userData) => {
  const message = `Please analyze this user data and provide insights:
  
${JSON.stringify(userData, null, 2)}

Please provide:
1. Key patterns or trends
2. Notable observations
3. Recommendations based on the data
4. Any interesting insights

Keep the response concise and actionable.`;

  return await sendMessageToClaude(message, 'You are a data analyst specializing in user behavior and insights.');
};

/**
 * Generates personalized recommendations
 * @param {Object} userProfile - User profile data
 * @param {Array} userHistory - User activity history
 * @returns {Promise<string>} Personalized recommendations
 */
export const generateRecommendations = async (userProfile, userHistory) => {
  const message = `Based on this user profile and history, generate personalized recommendations:

User Profile:
${JSON.stringify(userProfile, null, 2)}

User History:
${JSON.stringify(userHistory, null, 2)}

Please provide:
1. Personalized recommendations
2. Areas for improvement
3. Next steps
4. Motivational insights

Make the recommendations specific and actionable.`;

  return await sendMessageToClaude(message, 'You are a personal development coach who provides motivating and actionable advice.');
}; 