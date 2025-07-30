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
  AlertCircle
} from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTranscribing?: boolean;
}

const Interview: React.FC = () => {
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
  
  const vapiRef = useRef<Vapi | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Assistant configuration with your prompt
  const assistantConfig = {
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `[Identity]  
You are an AI voice-based interviewer dedicated to helping candidates prepare for job roles in their chosen domains. Your aim is to simulate a job interview experience that is both informative and supportive.

[Style]  
- Use a friendly, conversational, and professional tone.  
- Speak clearly and coherently, maintaining engagement and comfort.

[Response Guidelines]  
- Ask one question at a time and wait for the user's response.  
- Provide polite acknowledgments like "Thanks for the explanation" or "Interesting point".  
- Maintain a smooth and professional interaction.

[Task & Goals]  
1. Introduce yourself and set the context:  
   - Start with: "Hi, I'm your AI interviewer here to help you prepare for your dream job. Let's begin!"
2. Ask about the candidate's technical skills:  
   - "Let's start by understanding your skill set. What technologies and tools are you most comfortable with?"  
3. Inquire about their domain interests:  
   - "Which domain or industry would you like to work in?"  
4. Ask about their company aspirations:  
   - "Do you have any companies in mind that you're targeting or dream of working with?"  
5. Tailor your follow-up questions based on their domain interest:  
   - For Web Development: Explore topics like React, APIs, deployment.  
   - For Data Science: Discuss pandas, machine learning, model evaluation.  
6. Evaluate their understanding without direct feedback, using polite acknowledgments.  
7. End the interview with a friendly closing:  
   - "Thank you for sharing your thoughts. I wish you all the best in your journey!"

[Error Handling / Fallback]  
- If no response is detected after 10 seconds, gently prompt the user again to ensure engagement.  
- If the user's input is unclear, ask for clarification politely and proceed based on their response.  
- Continuously adapt questions according to the user's prior responses to maintain relevance and interest.`
        }
      ]
    },
    voice: {
      provider: "openai",
      voiceId: "alloy"
    },
    firstMessage: "Hi, I'm your AI interviewer here to help you prepare for your dream job. Let's begin!"
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
      addMessage('assistant', 'Interview session started. Please wait for the interviewer to begin...');
    });

    vapiRef.current.on('call-end', () => {
      setIsConnected(false);
      setIsListening(false);
      setIsUserSpeaking(false);
      setConnectionStatus('Disconnected');
      setCurrentTranscript('');
      stopTimer();
      addMessage('assistant', 'Interview session ended. Thank you for participating!');
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
            // Update current assistant message or create new one
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

  const startInterview = async () => {
    if (!vapiRef.current) {
      setError('Vapi SDK not loaded. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConnectionStatus('Connecting...');
    setConversation([]);
    setSessionDuration(0);

    try {
      await vapiRef.current.start(assistantConfig);
    } catch (error) {
      console.error('Failed to start interview:', error);
      setError('Failed to start interview. Please check your connection and try again.');
      setConnectionStatus('Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    if (!vapiRef.current) return;

    setIsLoading(true);
    try {
      await vapiRef.current.stop();
    } catch (error) {
      console.error('Failed to end interview:', error);
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

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mic className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Voice Interview</h1>
          <p className="text-gray-600 text-lg">Practice with our advanced AI interviewer and boost your confidence</p>
        </div>

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
                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatDuration(sessionDuration)}</span>
                </div>
              )}
              
              {isListening && (
                <div className="flex items-center space-x-3 text-blue-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-8 bg-blue-500 rounded-full animate-pulse animation-delay-100"></div>
                    <div className="w-2 h-4 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-2 h-7 bg-blue-500 rounded-full animate-pulse animation-delay-300"></div>
                  </div>
                  <span className="font-medium">Listening...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {isConnected && (
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
          {/* Interview Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Interview Controls</h2>
              </div>
              
              {!isConnected ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Before You Start:
                    </h3>
                    <ul className="text-blue-800 space-y-3">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Ensure your microphone is working properly</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Find a quiet, distraction-free environment</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Speak clearly and at a normal pace</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Be prepared to discuss your skills and experience</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={startInterview}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <>
                        <Phone className="h-6 w-6" />
                        <span className="text-lg">Start Interview</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Interview Active
                    </h3>
                    <p className="text-green-800">
                      The AI interviewer is ready. Listen carefully and respond naturally to the questions.
                    </p>
                  </div>
                  
                  <button
                    onClick={endInterview}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <>
                        <PhoneOff className="h-6 w-6" />
                        <span className="text-lg">End Interview</span>
                      </>
                    )}
                  </button>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Quick Tips:
                    </h4>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Take your time to think before responding</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Provide specific examples from your experience</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Ask for clarification if a question is unclear</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Stay confident and maintain a positive attitude</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-[600px]">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Live Conversation</h2>
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
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <Bot className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready for Your Interview</h3>
                    <p className="text-gray-600 max-w-md leading-relaxed">
                      Click "Start Interview" to begin your AI-powered interview session. 
                      The conversation will appear here in real-time with live transcription.
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
                            {message.type === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
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
                            {isUserSpeaking ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
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
                                {isUserSpeaking ? 'You are speaking...' : 'AI is speaking...'}
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

export default Interview;