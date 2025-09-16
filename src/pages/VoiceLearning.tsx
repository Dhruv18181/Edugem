import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  GraduationCap, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Target, 
  Plus, 
  X, 
  Settings, 
  Maximize2, 
  Minimize2, 
  MoreVertical 
} from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LearningTopic {
  id: string;
  title: string;
  description: string;
}

const VoiceLearning: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showTopicSetup, setShowTopicSetup] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const vapiRef = useRef<Vapi | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const predefinedTopics: LearningTopic[] = [
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
      setConnectionStatus('Disconnected');
      stopTimer();
      addMessage('assistant', 'Learning session ended. Great job today! Keep practicing what you learned.');
    });

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcript) {
        const content = message.transcript.content || message.transcript.text || '';
        if (message.transcript.role === 'user' && content.trim()) {
          addMessage('user', content);
        } else if (message.transcript.role === 'assistant' && content.trim()) {
          addMessage('assistant', content);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Voice Learning with AI Tutor
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Learn any subject through interactive voice conversations with your personal AI tutor
            </p>
          </div>
        </div>

        {/* Status Bar */}
        {!showTopicSetup && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="text-white font-medium">
                    {connectionStatus}
                  </span>
                </div>
                
                {isConnected && (
                  <>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{formatDuration(sessionDuration)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/80">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {selectedTopic === 'custom' ? customTopic : 
                          predefinedTopics.find(t => t.id === selectedTopic)?.title}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/30 rounded-full text-xs capitalize">
                        {difficulty}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isConnected && (
                  <button
                    onClick={resetSetup}
                    className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                    title="Change Topic"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showTopicSetup ? (
          /* Topic Setup */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Set Up Your Learning Session</h2>
                <p className="text-blue-100 text-lg">Select a topic and customize your learning experience.</p>
              </div>

              <div className="space-y-8">
                {/* Topic Selection */}
                <div>
                  <label className="block text-lg font-medium text-white mb-4">
                    What would you like to learn?
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-900">Select a topic</option>
                    {predefinedTopics.map((topic) => (
                      <option key={topic.id} value={topic.id} className="text-gray-900">{topic.title}</option>
                    ))}
                  </select>
                  {selectedTopic === 'custom' && (
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter your custom topic"
                      className="w-full p-4 mt-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  )}
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-lg font-medium text-white mb-4">
                    What's your current level?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 capitalize ${
                          difficulty === level
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-white/20 hover:border-white/40 text-white/80 hover:text-white bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-semibold text-lg">{level}</div>
                        <div className="text-sm mt-1 opacity-80">
                          {level === 'beginner' && 'Basic concepts and definitions'}
                          {level === 'intermediate' && 'Detailed explanations and examples'}
                          {level === 'advanced' && 'Complex scenarios and applications'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Goals */}
                <div>
                  <label className="block text-lg font-medium text-white mb-4">
                    Specific learning goals (optional)
                  </label>
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLearningGoal()}
                      placeholder="e.g., Learn about functions"
                      className="flex-1 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                    <button
                      onClick={addLearningGoal}
                      className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {learningGoals.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {learningGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-500/30"
                        >
                          {goal}
                          <button
                            onClick={() => removeLearningGoal(goal)}
                            className="ml-2 hover:text-purple-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <span>Microphone access enabled</span>
                  </div>
                  <div className="flex items-center space-x-3 text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <span>AI tutor connected</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startLearningSession}
                  disabled={!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim()) || isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 text-xl shadow-2xl"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Phone className="h-6 w-6" />
                      <span>Start Learning Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Learning Interface */
          <div className="space-y-8">
            {/* Participants Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Tutor */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <GraduationCap className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Tutor</h3>
                  <p className="text-white/70">Your personal learning assistant</p>
                </div>
              </div>

              {/* User */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl relative">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">You</h3>
                  <p className="text-white/70">Ready to learn</p>
                </div>
                
                {/* Muted Indicator */}
                {isMuted && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-500 rounded-full p-3">
                      <MicOff className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center space-x-6">
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  disabled={!isConnected}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/20 hover:bg-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
                </button>

                {/* Main Call Button */}
                {!isConnected ? (
                  <button
                    onClick={() => setShowTopicSetup(true)}
                    disabled={isLoading}
                    className="p-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 rounded-full transition-all duration-200 disabled:cursor-not-allowed shadow-2xl"
                    title="Start Learning Session"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                    ) : (
                      <Phone className="h-8 w-8 text-white" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={endLearningSession}
                    disabled={isLoading}
                    className="p-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 rounded-full transition-all duration-200 disabled:cursor-not-allowed shadow-2xl"
                    title="End Learning Session"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                    ) : (
                      <PhoneOff className="h-8 w-8 text-white" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Conversation History */}
            {conversation.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Conversation</h3>
                <div className="space-y-4">
                  {conversation.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {message.type === 'user' ? <User className="h-4 w-4 text-white" /> : <GraduationCap className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm">{message.content}</div>
                        <div className="text-white/50 text-xs mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-4 hover:bg-red-600 rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceLearning;