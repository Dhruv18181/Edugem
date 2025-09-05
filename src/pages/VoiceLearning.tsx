import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  User, 
  Bot, 
  Play, 
  Square,
  Sparkles,
  Clock,
  MessageSquare,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Target,
  Send,
  Plus,
  X
} from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTranscribing?: boolean;
}

interface LearningTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const VoiceLearning: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showTopicSetup, setShowTopicSetup] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState<string>('');
  
  const vapiRef = useRef<Vapi | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const predefinedTopics = [
    { id: 'javascript', title: 'JavaScript Programming', description: 'Learn modern JavaScript from basics to advanced concepts' },
    { id: 'react', title: 'React Development', description: 'Master React components, hooks, and state management' },
    { id: 'python', title: 'Python Programming', description: 'Python fundamentals and data structures' },
    { id: 'machine-learning', title: 'Machine Learning', description: 'Introduction to ML algorithms and concepts' },
    { id: 'web-design', title: 'Web Design', description: 'HTML, CSS, and responsive design principles' },
    { id: 'data-science', title: 'Data Science', description: 'Data analysis, visualization, and statistics' },
    { id: 'mathematics', title: 'Mathematics', description: 'Algebra, calculus, and mathematical concepts' },
    { id: 'physics', title: 'Physics', description: 'Fundamental physics principles and applications' },
    { id: 'custom', title: 'Custom Topic', description: 'Specify your own learning topic' }
  ];

  // Generate assistant configuration based on user preferences
  const generateAssistantConfig = () => {
    const topicTitle = selectedTopic === 'custom' ? customTopic : 
      predefinedTopics.find(t => t.id === selectedTopic)?.title || 'General Topic';
    
    const goalsText = learningGoals.length > 0 ? 
      `The user wants to focus on these specific goals: ${learningGoals.join(', ')}.` : '';

    return {
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `[Identity]  
You are an expert AI voice-based tutor specializing in personalized education. You're teaching "${topicTitle}" at a ${difficulty} level. Your goal is to provide clear, engaging, and interactive learning experiences.

[Teaching Style]  
- Use a friendly, encouraging, and patient tone
- Break down complex concepts into digestible parts
- Ask questions to check understanding
- Provide real-world examples and analogies
- Adapt your pace based on the student's responses
- Encourage questions and curiosity

[Current Learning Session]
- Topic: ${topicTitle}
- Difficulty Level: ${difficulty}
- ${goalsText}

[Response Guidelines]  
- Start each session by asking what specific aspect they'd like to learn first
- Explain concepts clearly with examples
- Ask comprehension questions regularly
- Provide encouragement and positive reinforcement
- If the student seems confused, rephrase or provide simpler explanations
- Build on previous knowledge progressively

[Session Structure]
1. Welcome and assess current knowledge level
2. Introduce key concepts with examples
3. Interactive Q&A to reinforce learning
4. Practical applications or exercises
5. Summary and next steps

[Error Handling]
- If the student asks about topics outside your expertise, acknowledge limitations and redirect to the current topic
- If audio is unclear, politely ask for repetition
- Maintain focus on the learning objectives while being flexible to student interests

Remember: You're not just providing information, you're facilitating active learning through conversation.`
          }
        ]
      },
      voice: {
        provider: "openai",
        voiceId: "alloy"
      },
      firstMessage: `Hello! I'm your personal AI tutor, and I'm excited to help you learn ${topicTitle} at a ${difficulty} level. ${goalsText} Let's start by understanding what you already know about this topic. What would you like to explore first?`
    };
  };

  useEffect(() => {
    // Initialize Vapi SDK
    if (import.meta.env.VITE_VAPI_PUBLIC_KEY) {
      vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
      setupVapiEventListeners();
    } else {
      setError('Vapi public key not found. Please check your environment variables.');
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, currentTranscript]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startTimer = () => {
    sessionStartRef.current = new Date();
    timerRef.current = setInterval(() => {
      if (sessionStartRef.current) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000);
        setSessionDuration(diff);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionStartRef.current = null;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setupVapiEventListeners = () => {
    if (!vapiRef.current) return;

    vapiRef.current.on('call-start', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      setError(null);
      startTimer();
      setShowTopicSetup(false);
      addMessage('assistant', 'Learning session started. Your AI tutor is ready to begin...');
    });

    vapiRef.current.on('call-end', () => {
      setIsConnected(false);
      setIsListening(false);
      setIsUserSpeaking(false);
      setConnectionStatus('Disconnected');
      setCurrentTranscript('');
      stopTimer();
      addMessage('assistant', 'Learning session ended. Great job today! Keep practicing what you learned.');
    });

    vapiRef.current.on('speech-start', () => {
      setIsListening(true);
      setIsUserSpeaking(true);
    });

    vapiRef.current.on('speech-end', () => {
      setIsListening(false);
      setIsUserSpeaking(false);
      setCurrentTranscript('');
    });

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcript) {
        const content = message.transcript.content || message.transcript.text || '';
        
        if (message.transcript.role === 'user') {
          if (message.transcript.transcriptType === 'partial') {
            setCurrentTranscript(content);
          } else {
            setCurrentTranscript('');
            if (content.trim()) {
              addMessage('user', content);
            }
          }
        } else if (message.transcript.role === 'assistant') {
          if (message.transcript.transcriptType === 'partial') {
            setCurrentTranscript(content);
          } else {
            setCurrentTranscript('');
            if (content.trim()) {
              addMessage('assistant', content);
            }
          }
        }
      }
    });

    vapiRef.current.on('error', (error: any) => {
      console.error('Vapi error:', error);
      setError('Connection error occurred. Please try again.');
      setIsConnected(false);
      setConnectionStatus('Error');
      stopTimer();
    });
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, newMessage]);
  };

  const startLearningSession = async () => {
    if (!vapiRef.current) {
      setError('Vapi SDK not loaded. Please refresh the page.');
      return;
    }

    if (!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim())) {
      setError('Please select a topic or enter a custom topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConnectionStatus('Connecting...');
    setConversation([]);
    setSessionDuration(0);

    try {
      const assistantConfig = generateAssistantConfig();
      await vapiRef.current.start(assistantConfig);
    } catch (error) {
      console.error('Failed to start learning session:', error);
      setError('Failed to start learning session. Please check your connection and try again.');
      setConnectionStatus('Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const endLearningSession = async () => {
    if (!vapiRef.current) return;

    setIsLoading(true);
    try {
      await vapiRef.current.stop();
    } catch (error) {
      console.error('Failed to end learning session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    
    const newMutedState = !isMuted;
    vapiRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  const addLearningGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeLearningGoal = (goal: string) => {
    setLearningGoals(learningGoals.filter(g => g !== goal));
  };

  const resetSetup = () => {
    setShowTopicSetup(true);
    setSelectedTopic('');
    setCustomTopic('');
    setDifficulty('beginner');
    setLearningGoals([]);
    setConversation([]);
    setSessionDuration(0);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Learning Assistant</h1>
          <p className="text-gray-600 text-lg">Your personalized voice tutor for any subject</p>
        </div>

        {/* Topic Setup Modal */}
        {showTopicSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Learning Session</h2>
                <p className="text-gray-600">Tell us what you want to learn and we'll create a personalized experience</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What would you like to learn?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {predefinedTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          selectedTopic === topic.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">{topic.title}</div>
                        <div className="text-sm text-gray-600">{topic.description}</div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedTopic === 'custom' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="Enter your custom topic (e.g., Quantum Physics, Digital Marketing, etc.)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What's your current level?
                  </label>
                  <div className="flex space-x-4">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 capitalize ${
                          difficulty === level
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specific learning goals (optional)
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLearningGoal()}
                      placeholder="e.g., Learn about functions, Understand loops, etc."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={addLearningGoal}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {learningGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {learningGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {goal}
                          <button
                            onClick={() => removeLearningGoal(goal)}
                            className="ml-2 hover:text-purple-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowTopicSetup(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startLearningSession}
                  disabled={!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim()) || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Start Learning</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-gray-900 font-medium">
                  {connectionStatus}
                </span>
              </div>
              
              {isConnected && (
                <>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-mono text-lg">{formatDuration(sessionDuration)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700">
                      {selectedTopic === 'custom' ? customTopic : 
                        predefinedTopics.find(t => t.id === selectedTopic)?.title}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize">
                      {difficulty}
                    </span>
                  </div>
                </>
              )}
              
              {isListening && (
                <div className="flex items-center space-x-3 text-purple-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-6 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-8 bg-purple-500 rounded-full animate-pulse animation-delay-100"></div>
                    <div className="w-2 h-4 bg-purple-500 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-2 h-7 bg-purple-500 rounded-full animate-pulse animation-delay-300"></div>
                  </div>
                  <span className="font-medium">Listening...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {isConnected && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isMuted 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={resetSetup}
                    className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all duration-200"
                    title="Change Topic"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Learning Session</h2>
              </div>
              
              {!isConnected ? (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Ready to Learn:
                    </h3>
                    <ul className="text-purple-800 space-y-3">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Your AI tutor will adapt to your learning pace</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Ask questions anytime during the session</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Interactive learning with real-world examples</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Progress tracking and personalized feedback</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => setShowTopicSetup(true)}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-lg">Start Learning Session</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Learning Active
                    </h3>
                    <p className="text-green-800">
                      Your AI tutor is ready to teach. Speak naturally and ask questions anytime!
                    </p>
                  </div>
                  
                  <button
                    onClick={endLearningSession}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <>
                        <PhoneOff className="h-6 w-6" />
                        <span className="text-lg">End Session</span>
                      </>
                    )}
                  </button>
                  
                  {/* Learning Goals Display */}
                  {learningGoals.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Your Goals:
                      </h4>
                      <div className="space-y-2">
                        {learningGoals.map((goal, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conversation Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-[600px]">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Live Learning Session</h2>
                  {isConnected && (
                    <div className="flex items-center space-x-2 ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {conversation.length === 0 && !currentTranscript ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready to Start Learning</h3>
                    <p className="text-gray-600 max-w-md leading-relaxed">
                      Set up your learning preferences and start your personalized voice learning session. 
                      Your AI tutor will guide you through the topic step by step.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-4 max-w-2xl ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                              : 'bg-gradient-to-br from-purple-500 to-pink-600'
                          }`}>
                            {message.type === 'user' ? <User className="h-5 w-5 text-white" /> : <GraduationCap className="h-5 w-5 text-white" />}
                          </div>
                          
                          <div className={`rounded-2xl px-6 py-4 shadow-md ${
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                            <div className={`text-xs mt-3 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Current Transcript */}
                    {currentTranscript && (
                      <div className={`flex ${isUserSpeaking ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-4 max-w-2xl ${
                          isUserSpeaking ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            isUserSpeaking 
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                              : 'bg-gradient-to-br from-purple-500 to-pink-600'
                          }`}>
                            {isUserSpeaking ? <User className="h-5 w-5 text-white" /> : <GraduationCap className="h-5 w-5 text-white" />}
                          </div>
                          
                          <div className={`rounded-2xl px-6 py-4 shadow-md border-2 border-dashed ${
                            isUserSpeaking
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-purple-50 text-purple-900 border-purple-300'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce animation-delay-100"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce animation-delay-200"></div>
                              </div>
                              <span className="text-xs opacity-75">
                                {isUserSpeaking ? 'You are speaking...' : 'AI Tutor is speaking...'}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                              {currentTranscript}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={conversationEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceLearning;