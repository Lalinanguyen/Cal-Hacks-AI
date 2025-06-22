import { CLAUDE_API_KEY } from './env.js';

// Claude AI ranking service
export const getClaudeRanking = async (students, userProfile) => {
  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    console.log('🤖 Sending ranking request to Claude...');
    
    const prompt = `Rank these ${students.length} Berkeley students by professional potential. Consider: LinkedIn connections, skills, company quality, and career trajectory.

Students:
${students.map((student, index) => 
  `${index + 1}. ${student.Name} - ${student.Title} at ${student.Company}, ${student.LinkedInConnections} connections, Skills: ${student.Skills}`
).join('\n')}

User: ${userProfile?.Name || 'Unknown'} - ${userProfile?.Title || 'Student'}

Respond ONLY with this JSON format:
{
  "rankings": [
    {
      "name": "Student Name",
      "rank": 1,
      "score": 95,
      "reasoning": "Brief explanation",
      "strengths": ["strength1", "strength2"],
      "areas_for_improvement": ["area1", "area2"]
    }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Claude ranking response received');
    
    // Parse Claude's response
    const content = data.content[0].text;
    console.log('Claude raw response:', content); // Add this for debugging

    // Try to extract JSON, handling potential truncation
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      let jsonString = jsonMatch[0];
      
      // Check if JSON is complete by trying to parse it
      try {
        const rankingData = JSON.parse(jsonString);
        return {
          success: true,
          ranking: rankingData,
          rawResponse: content
        };
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('Raw content length:', content.length);
        console.error('JSON string length:', jsonString.length);
        
        // Try to fix common truncation issues
        if (parseError.message.includes('Unexpected end of input')) {
          console.log('🔄 Attempting to fix truncated JSON...');
          
          // Look for the last complete object in the rankings array
          const rankingsMatch = jsonString.match(/"rankings":\s*\[([\s\S]*?)\]/);
          if (rankingsMatch) {
            const rankingsContent = rankingsMatch[1];
            // Find the last complete ranking object
            const rankingObjects = rankingsContent.match(/\{[^}]*"rank":\s*\d+[^}]*\}/g);
            
            if (rankingObjects && rankingObjects.length > 0) {
              // Reconstruct JSON with complete objects only
              const completeRankings = rankingObjects.slice(0, -1); // Remove the last incomplete one
              const fixedJson = `{
                "rankings": [
                  ${completeRankings.join(',\n                  ')}
                ]
              }`;
              
              try {
                const fixedRankingData = JSON.parse(fixedJson);
                console.log('✅ Successfully fixed truncated JSON with', fixedRankingData.rankings.length, 'rankings');
                return {
                  success: true,
                  ranking: fixedRankingData,
                  rawResponse: content,
                  note: 'Response was truncated, showing complete rankings only'
                };
              } catch (fixError) {
                console.error('❌ Failed to fix JSON:', fixError.message);
              }
            }
          }
        }
        
        return {
          success: false,
          error: 'JSON parse error: ' + parseError.message,
          rawResponse: content
        };
      }
    } else {
      console.error('❌ No JSON found in Claude response. Raw content:', content);
      return {
        success: false,
        error: 'No JSON found in Claude response',
        rawResponse: content
      };
    }
  } catch (error) {
    console.error('❌ Claude ranking error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Claude AI industry insights service
export const getClaudeIndustryInsights = async (students) => {
  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    console.log('🤖 Sending insights request to Claude...');
    
    const prompt = `Based on these ${students.length} top Berkeley students, give me 3-4 key insights in 7 lines max. Be direct and human, not AI-like.

Students:
${students.map((student, index) => 
  `${index + 1}. ${student.Name} - ${student.Title} at ${student.Company}, ${student.LinkedInConnections} connections, Skills: ${student.Skills}`
).join('\n')}

Respond in this exact format (7 lines max):
🎯 Top Skills: [3 most valuable skills]
📈 Networking: [key networking insight]  
🏢 Industry: [main industry trend]
💡 Advice: [one actionable tip]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Claude insights response received');
    
    const insights = data.content[0].text;
    return {
      success: true,
      insights: insights
    };
  } catch (error) {
    console.error('❌ Claude insights error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 