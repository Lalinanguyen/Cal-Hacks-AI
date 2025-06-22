import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { sendMessageToClaude, generateRecommendations } from './claudeAPI';
import { getCleanedData } from './dataService';
import { getClaudePersonalizedRecommendations, getClaudeUserAnalysis } from './claudeRankingService';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (dot) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    };

    const animations = [
      createAnimation(dot1),
      createAnimation(dot2),
      createAnimation(dot3),
    ];
    
    const staggeredAnimations = [
        Animated.delay(0),
        Animated.delay(200),
        Animated.delay(400)
    ];

    Animated.stagger(200, animations.map((anim, i) => Animated.sequence([staggeredAnimations[i], anim]))).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.message}>
        <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY:dot3 }] }]}/>
            </View>
        </View>
    </View>
  );
};

const ImprovementScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Cal Career assistant powered by Claude AI. I can help you with networking, career advice, content creation, and professional insights. Let me help you rank up!",
      sender: 'assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getCleanedData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Create a context-aware system prompt
      const systemPrompt = `You are Cal Career, a professional AI assistant specializing in career development for UC Berkeley students. You provide:

1. Career advice and guidance
2. Networking strategies
3. Professional development tips
4. Industry insights
5. Resume and interview preparation
6. LinkedIn optimization advice

Keep responses concise, actionable, and encouraging. Use a friendly, professional tone. If the user asks about data or insights, you can reference that you have access to Berkeley student career data.`;

      const response = await sendMessageToClaude(inputText, systemPrompt);
      
      const assistantMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'assistant',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if API fails
      const fallbackResponses = [
        "I'm having trouble connecting to my AI brain right now, but I'd be happy to help you with career advice based on my knowledge!",
        "Let me think about that... In the meantime, here's some general career advice: networking and continuous learning are key to professional success.",
        "That's a great question! While I'm reconnecting, remember that building your personal brand and maintaining a strong LinkedIn presence are crucial for career growth."
      ];
      
      const assistantMessage = {
        id: messages.length + 2,
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        sender: 'assistant',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generatePersonalizedAdvice = async () => {
    if (userData.length === 0) {
      Alert.alert('No Data', 'Please wait for data to load before generating personalized advice.');
      return;
    }

    setIsTyping(true);
    
    try {
      // Get a sample user for personalized recommendations
      const sampleUser = userData[Math.floor(Math.random() * Math.min(userData.length, 10))];
      
      console.log('🤖 Getting personalized recommendations from Claude...');
      
      // Get personalized recommendations for the sample user
      const recommendationsResult = await getClaudePersonalizedRecommendations(sampleUser);
      
      // Get detailed user analysis
      const analysisResult = await getClaudeUserAnalysis(sampleUser);
      
      let adviceText = `Here's personalized advice based on Berkeley student data analysis:\n\n`;
      
      if (recommendationsResult.success) {
        adviceText += `**Personalized Recommendations:**\n${recommendationsResult.recommendations}\n\n`;
      }
      
      if (analysisResult.success) {
        adviceText += `**Detailed Analysis:**\n${analysisResult.analysis}\n\n`;
      }
      
      adviceText += `*Based on analysis of ${userData.length} Berkeley students' profiles*`;
      
      const adviceMessage = {
        id: messages.length + 1,
        text: adviceText,
        sender: 'assistant',
      };
      setMessages(prev => [...prev, adviceMessage]);
    } catch (error) {
      console.error('Error generating personalized advice:', error);
      
      // Fallback to original method if Claude ranking fails
      try {
        const userProfile = {
          university: 'UC Berkeley',
          dataSource: 'LinkedIn profiles',
          sampleSize: userData.length,
        };
        
        const userHistory = userData.slice(0, 20); // Use first 20 entries for context
        
        const advice = await generateRecommendations(userProfile, userHistory);
        
        const adviceMessage = {
          id: messages.length + 1,
          text: `Here's some personalized advice based on Berkeley student data:\n\n${advice}`,
          sender: 'assistant',
        };
        setMessages(prev => [...prev, adviceMessage]);
      } catch (fallbackError) {
        console.error('Fallback advice generation also failed:', fallbackError);
        Alert.alert('Error', 'Failed to generate personalized advice. Please try again.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);
  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
            <LinearGradient colors={['#0077b5', '#005582']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Cal Career</Text>
                        <Text style={styles.headerSubtitle}>Your professional AI assistant</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.adviceButton} 
                        onPress={generatePersonalizedAdvice}
                        disabled={isTyping}
                    >
                        <Text style={styles.adviceButtonText}>💡</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            
            <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
                {messages.map(msg => (
                    <View key={msg.id} style={[styles.message, msg.sender === 'user' ? styles.userMessage : styles.assistantMessage]}>
                        <LinearGradient 
                            colors={msg.sender === 'user' ? ['#0077b5', '#0066a0'] : ['#ffffff', '#ffffff']}
                            style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.assistantBubble]}
                        >
                            <Text style={msg.sender === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                                {msg.text}
                            </Text>
                        </LinearGradient>
                    </View>
                ))}
                {isTyping && <TypingIndicator />}
            </ScrollView>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask me anything..."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim()}>
                        <Text style={styles.sendButtonText}>➔</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 20,
    boxShadow: '0 2px 20px rgba(0, 119, 181, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  adviceButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  adviceButtonText: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  message: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  assistantMessageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  typingBubble: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: '80%',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  inputContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#0077b5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ImprovementScreen; 