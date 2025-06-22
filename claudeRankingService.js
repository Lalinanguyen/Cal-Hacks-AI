import { sendMessageToClaude } from './claudeAPI';
import { storeClaudeResponse } from './claudeStorageService';

/**
 * Claude AI Ranking Service
 * Uses Claude to analyze and rank users based on its own assessment
 */

/**
 * Sends user data to Claude for ranking analysis
 * @param {Array} userData - Array of user objects to rank
 * @returns {Promise<Object>} Claude's ranking analysis
 */
export const getClaudeRanking = async (userData) => {
  try {
    console.log('🤖 Sending data to Claude for ranking analysis...');
    
    const message = `Please analyze and rank these Berkeley Computer Science students based on their professional achievements, experience, and potential. 

Here is the data for ${userData.length} students:

${JSON.stringify(userData, null, 2)}

Please provide:
1. A ranked list from highest to lowest performing student
2. A score out of 100 for each student
3. Brief reasoning for each ranking
4. Overall insights about the group

Format your response as JSON with this structure:
{
  "rankings": [
    {
      "rank": 1,
      "name": "Student Name",
      "score": 95,
      "reasoning": "Brief explanation of why this rank",
      "strengths": ["strength1", "strength2"],
      "areas_for_improvement": ["area1", "area2"]
    }
  ],
  "insights": {
    "top_performers": "Analysis of top performers",
    "common_patterns": "Common patterns in the data",
    "recommendations": "General recommendations for the group"
  }
}

Be thorough but concise in your analysis.`;

    const response = await sendMessageToClaude(
      message,
      'You are an expert career counselor and data analyst specializing in evaluating computer science professionals. Provide fair, objective rankings based on professional achievements, experience, skills, and potential.'
    );

    // Store the Claude response
    await storeClaudeResponse(
      'claude_ranking_analysis',
      response,
      'ranking_analysis'
    );

    // Try to parse JSON from Claude's response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedRanking = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          ranking: parsedRanking,
          rawResponse: response
        };
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON from Claude response, returning raw response');
    }

    return {
      success: true,
      ranking: null,
      rawResponse: response
    };

  } catch (error) {
    console.error('❌ Error getting Claude ranking:', error);
    throw error;
  }
};

/**
 * Gets detailed analysis for a specific user
 * @param {Object} user - User data object
 * @returns {Promise<Object>} Claude's detailed analysis
 */
export const getClaudeUserAnalysis = async (user) => {
  try {
    const message = `Please provide a detailed analysis of this Berkeley Computer Science student:

${JSON.stringify(user, null, 2)}

Please provide:
1. Overall assessment score (0-100)
2. Strengths and achievements
3. Areas for improvement
4. Career recommendations
5. Skill development suggestions
6. Networking opportunities

Be specific and actionable in your recommendations.`;

    const response = await sendMessageToClaude(
      message,
      'You are an expert career counselor specializing in computer science professionals. Provide detailed, actionable advice.'
    );

    // Store the analysis
    await storeClaudeResponse(
      `user_analysis_${user.Name}`,
      response,
      'user_analysis'
    );

    return {
      success: true,
      analysis: response
    };

  } catch (error) {
    console.error('❌ Error getting Claude user analysis:', error);
    throw error;
  }
};

/**
 * Gets comparative analysis between multiple users
 * @param {Array} users - Array of user objects to compare
 * @returns {Promise<Object>} Claude's comparative analysis
 */
export const getClaudeComparativeAnalysis = async (users) => {
  try {
    const message = `Please provide a comparative analysis of these Berkeley Computer Science students:

${JSON.stringify(users, null, 2)}

Please provide:
1. Comparative ranking with scores
2. Key differences between them
3. Relative strengths and weaknesses
4. Collaborative opportunities
5. Team formation recommendations
6. Learning from each other

Focus on how they can learn from and complement each other.`;

    const response = await sendMessageToClaude(
      message,
      'You are an expert team builder and career counselor. Focus on how these individuals can work together and learn from each other.'
    );

    // Store the analysis
    await storeClaudeResponse(
      'comparative_analysis',
      response,
      'comparative_analysis'
    );

    return {
      success: true,
      analysis: response
    };

  } catch (error) {
    console.error('❌ Error getting Claude comparative analysis:', error);
    throw error;
  }
};

/**
 * Gets industry insights and trends analysis
 * @param {Array} userData - Array of user objects
 * @returns {Promise<Object>} Claude's industry insights
 */
export const getClaudeIndustryInsights = async (userData) => {
  try {
    const message = `Based on this data from Berkeley Computer Science students, please provide industry insights:

${JSON.stringify(userData, null, 2)}

Please provide:
1. Current industry trends reflected in the data
2. In-demand skills and technologies
3. Salary and compensation insights
4. Geographic distribution analysis
5. Company preferences and patterns
6. Future career opportunities
7. Recommendations for current students

Focus on actionable insights for current students.`;

    const response = await sendMessageToClaude(
      message,
      'You are an expert industry analyst specializing in technology careers. Provide insights that help current students make informed career decisions.'
    );

    // Store the insights
    await storeClaudeResponse(
      'industry_insights',
      response,
      'industry_insights'
    );

    return {
      success: true,
      insights: response
    };

  } catch (error) {
    console.error('❌ Error getting Claude industry insights:', error);
    throw error;
  }
};

/**
 * Gets personalized recommendations for improvement
 * @param {Object} user - User data object
 * @returns {Promise<Object>} Claude's personalized recommendations
 */
export const getClaudePersonalizedRecommendations = async (user) => {
  try {
    const message = `Please provide personalized recommendations for this Berkeley Computer Science student to improve their professional profile:

${JSON.stringify(user, null, 2)}

Please provide:
1. Immediate actions (next 30 days)
2. Short-term goals (3-6 months)
3. Long-term career planning (1-2 years)
4. Skill development roadmap
5. Networking strategies
6. Project recommendations
7. Learning resources
8. Mentorship opportunities

Be specific, actionable, and tailored to their current situation.`;

    const response = await sendMessageToClaude(
      message,
      'You are an expert career coach specializing in computer science professionals. Provide personalized, actionable recommendations.'
    );

    // Store the recommendations
    await storeClaudeResponse(
      `personalized_recommendations_${user.Name}`,
      response,
      'personalized_recommendations'
    );

    return {
      success: true,
      recommendations: response
    };

  } catch (error) {
    console.error('❌ Error getting Claude personalized recommendations:', error);
    throw error;
  }
}; 