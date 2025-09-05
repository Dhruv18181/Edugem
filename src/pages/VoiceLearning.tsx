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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-white text-gray-900 flex flex-col`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionStatus}
            </span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatDuration(sessionDuration)}</span>
              <BookOpen className="h-4 w-4 ml-2 text-purple-600" />
              <span>
                {selectedTopic === 'custom' ? customTopic : 
                  predefinedTopics.find(t => t.id === selectedTopic)?.title}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize">
                {difficulty}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isConnected && (
            <button
              onClick={resetSetup}
              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200"
              title="Change Topic"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Participants Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* AI Tutor */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <GraduationCap className="h-16 w-16 text-white" />
                </div>
              </div>
              
              {/* AI Label */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-gray-900 text-sm font-medium">AI Tutor</span>
                </div>
              </div>
            </div>

            {/* User */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl">
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
              
              {/* Muted Indicator */}
              {isMuted && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <MicOff className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* User Label */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-gray-900 text-sm font-medium">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-gray-100 border-t border-gray-200 p-4">
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                disabled={!isConnected}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-gray-900" />}
              </button>

              {/* Main Call Button */}
              {!isConnected ? (
                <button
                  onClick={() => setShowTopicSetup(true)}
                  disabled={isLoading}
                  className="p-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                  title="Start Learning Session"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <Phone className="h-6 w-6 text-white" />
                  )}
                </button>
              ) : (
                <button
                  onClick={endLearningSession}
                  disabled={isLoading}
                  className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                  title="End Learning Session"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <PhoneOff className="h-6 w-6 text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
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

      {/* Topic Setup Modal */}
      {showTopicSetup && (
        <div className="absolute inset-0 bg-gray-100/95 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Learning Session</h2>
              <p className="text-gray-600">Select a topic and customize your learning experience.</p>
            </div>

            <div className="space-y-6">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to learn?
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a topic</option>
                  {predefinedTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
                {selectedTopic === 'custom' && (
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter your custom topic"
                    className="w-full p-3 mt-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your current level?
                </label>
                <div className="flex space-x-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific learning goals (optional)
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLearningGoal()}
                    placeholder="e.g., Learn about functions"
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

              <div className="flex items-center space-x-3 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Microphone access enabled</span>
              </div>
              <div className="flex items-center space-x-3 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">AI tutor connected</span>
              </div>
            </div>

            <button
              onClick={startLearningSession}
              disabled={!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim()) || isLoading}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  <span>Start Learning Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceLearning;