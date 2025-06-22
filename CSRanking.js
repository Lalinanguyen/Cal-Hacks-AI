import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * @file CSRanking.js
 * This file contains the core logic for calculating CS-related rankings.
 */

/**
 * CSRankingScreen Component
 * 
 * This screen is intended to display computer science related rankings.
 * Let me know how you'd like to implement the ranking logic and what data to display!
 */
const CSRankingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CS Ranking Screen</Text>
      <Text>This screen will contain the CS ranking logic and display.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

/**
 * Calculates a ranking score using a keyword-based system.
 * This function provides a base scoring system that you can customize.
 * @param {object} profile - The user's profile data.
 * @returns {number} The calculated ranking score.
 */
export const calculateCSRanking = (profile) => {
  // --- Ranking Logic Here ---
  // Let me know what criteria to use for the calculation!
  //
  // For example, we could assign points for:
  // - Years of experience
  // - Specific skills (e.g., 'React Native', 'Python')
  // - Education level (e.g., 'B.S.', 'M.S.')

  console.log('Calculating CS Ranking for:', profile);
  
  let score = 0;

  // Example: Add 10 points for every year of experience
  // if (profile.yearsOfExperience) {
  //   score += profile.yearsOfExperience * 10;
  // }

  return score;
};

/**
 * Calculates an advanced ranking score by asking Claude AI to evaluate a profile
 * specifically for a Data Science role.
 *
 * @param {object} profile - The user's profile data.
 * @returns {Promise<number>} A promise that resolves with the AI-generated score (0-100).
 */
export const getAIRankedScore = async (profile) => {
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

  if (!apiKey) {
    console.error("API key is not set. Please create a .env file.");
    return 0;
  }

  // This prompt is now specifically tailored to evaluate Data Science profiles.
  const prompt = `
    Analyze the following professional profile and return a single integer score from 0 to 100 representing their career strength specifically for a Data Science role.
    - Give high value to experience like 'Data Scientist', 'ML Engineer', or 'Data Analyst'.
    - Give high value to education in fields like 'Data Science', 'Statistics', or 'Computer Science'.
    - Give high value to skills like 'Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', and 'Scikit-learn'.
    - Base your entire analysis ONLY on the data provided below.

    The profile is:
    - Experience: ${profile.experience.map(e => e.text).join(', ')}
    - Education: ${profile.education.map(e => e.text).join(', ')}
    - Skills: ${profile.skills ? profile.skills.join(', ') : 'Not Listed'}

    Based on this data, what is their career strength score for a Data Science position?
    Return ONLY the integer number (e.g., "85").
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.content && data.content.length > 0) {
      const textResponse = data.content[0].text;
      const score = parseInt(textResponse.match(/\d+/)?.[0] || '0', 10);
      console.log(`AI-generated Data Science score: ${score}`);
      return score;
    } else {
      console.error("Received an unexpected AI response:", data);
      return 0;
    }
  } catch (error) {
    console.error("Error fetching from Claude API for ranking:", error);
    return 0;
  }
};

export default CSRankingScreen; 