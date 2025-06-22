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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Cal Career assistant, powered by Claude. How can I help you rank up?",
      sender: 'assistant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const getClaudeResponse = async (prompt) => {
    const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

    if (!apiKey) {
      return "API key is not set. Please create a .env file with your key.";
    }

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
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      
      if (data.content && data.content.length > 0) {
        return data.content[0].text;
      } else {
        return "I received an unexpected response. Please try again.";
      }
    } catch (error) {
      console.error("Error fetching from Claude API:", error);
      return "Sorry, I couldn't connect to the AI service.";
    }
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const assistantResponse = await getClaudeResponse(inputText);
    setIsTyping(false);

    const assistantMessage = {
      id: messages.length + 2,
      text: assistantResponse,
      sender: 'assistant',
    };
    setMessages(prev => [...prev, assistantMessage]);
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
                <Text style={styles.headerTitle}>Cal Career</Text>
                <Text style={styles.headerSubtitle}>Your professional AI assistant</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9'
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
  inputContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e1e5e9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0077b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
    transform: [{ rotate: '-45deg' }]
  },
  typingBubble: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#e1e5e9',
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      padding: 12
  },
  typingDots: {
      flexDirection: 'row',
      gap: 4
  },
  dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#0077b5'
  }
});

export default ImprovementScreen; 