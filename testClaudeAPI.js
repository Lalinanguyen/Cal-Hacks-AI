import { sendMessageToClaude } from './claudeAPI.js';

const testClaudeAPI = async () => {
  try {
    console.log('🧪 Testing Claude API connectivity...');
    
    const testMessage = 'Hello! Please respond with "Claude API is working correctly" if you can see this message.';
    
    const response = await sendMessageToClaude(testMessage, 'You are a helpful assistant.');
    
    console.log('✅ Claude API Response:', response);
    console.log('🎉 Claude API is working correctly!');
    
    return true;
  } catch (error) {
    console.error('❌ Claude API Test Failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Run the test
testClaudeAPI(); 