import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Users, 
  MoreVertical, 
  Maximize2, 
  Minimize2,
  Clock,
  AlertCircle,
  Bot,
  User,
  CheckCircle,
  ArrowLeft,
  Star,
  Globe,
  Award,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

interface InterviewerAgent {
  id: string;
  name: string;
  title: string;
  description: string;
  accent: string;
  expertise: string[];
  avatarUrl: string;
  color: string;
  rating: number;
  interviews: number;
}

const Interview: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<InterviewerAgent | null>(null);
  const [showAgentSelection, setShowAgentSelection] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<{user: string, assistant: string}>({user: '', assistant: ''});
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<{user: boolean, assistant: boolean}>({user: false, assistant: false});
  const [showTranscript, setShowTranscript] = useState(true);
  
  const vapiRef = useRef<Vapi | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const interviewers: InterviewerAgent[] = [
    {
      id: 'b50895a7-598d-49f8-8aff-0d3133df4a1f',
      name: 'Elliot',
      title: 'Senior Full-Stack Developer Interviewer',
      description: 'Experienced Canadian interviewer specializing in technical roles and software engineering positions.',
      accent: 'Canadian English',
      expertise: ['Technical Interviews', 'Software Engineering', 'System Design', 'Problem Solving'],
      avatarUrl: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      color: 'from-blue-500 to-cyan-500',
      rating: 4.9,
      interviews: 1250
    },
    {
  id: 'ce3261d3-a408-4139-b3da-c29d646e22ce',
  name: 'Harry',
  title: 'Mobile App Developer',
  description: 'Professional and energetic interviewer with a clear communication style, specializing in mobile app development for Android, iOS, and cross-platform frameworks.',
  accent: 'American English',
  expertise: ['Android Development (Kotlin, Java)', 'iOS Development (Swift)', 'Cross-Platform (Flutter, React Native)', 'App Architecture & Design Patterns', 'API Integration & Mobile UI/UX'],
  avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  color: 'from-blue-500 to-cyan-500',
  rating: 4.7,
  interviews: 870
},

    {
      id: 'c1a0b713-f594-492e-bbba-3550320124bc',
      name: 'Neha',
      title: 'Data Scientist Interviewer',
      description: 'Professional Indian interviewer with expertise in behavioral interviews and cultural fit assessment.',
      accent: 'Indian English',
      expertise: ['Behavioral Interviews', 'HR Screening', 'Cultural Fit', 'Leadership Assessment'],
      avatarUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      color: 'from-purple-500 to-pink-500',
      rating: 4.8,
      interviews: 980
    },
    {
  id: 'bf2d7c64-ac50-4d49-a547-7c2844e38ddb',
  name: 'Cole',
  title: 'Product & Strategy Expert',
  description: 'American interviewer with a deep voice, specializing in product management, strategy, and business development roles.',
  accent: 'Deep American English',
  expertise: ['Product Management', 'Strategy', 'Business Development', 'Market Analysis'],
  avatarUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  color: 'from-green-500 to-teal-500',
  rating: 4.9,
  interviews: 1100
},
    {
  id: '9eb19b81-5c86-4d12-95dd-93e3f9962910',
  name: 'Rohan',
  title: 'DevOps Engineer',
  description: 'Indian-American interviewer focused on DevOps, cloud infrastructure, and automation roles.',
  accent: 'Indian-American English',
  expertise: ['CI/CD Pipelines', 'Cloud Infrastructure (AWS, Azure, GCP)', 'Containerization (Docker, Kubernetes)', 'Infrastructure as Code (Terraform, Ansible)', 'Monitoring & Logging'],
  avatarUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  color: 'from-green-500 to-teal-500',
  rating: 4.9,
  interviews: 1100
},
    {
  id: 'c422028e-965b-4c6a-9399-22a3f953b6f2',
  name: 'Hana',
  title: 'Machine Learning Engineer',
  description: 'Asian interviewer with a gentle tone, specializing in machine learning, deep learning, and AI engineering roles.',
  accent: 'Asian English',
  expertise: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Model Deployment', 'MLOps'],
  avatarUrl: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  color: 'from-purple-500 to-indigo-500',
  rating: 4.8,
  interviews: 940
}


  ];

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

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

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
      setShowAgentSelection(false);
      addMessage('assistant', `Hello! I'm ${selectedAgent?.name}. I'm ready to conduct your interview. Let's begin!`);
    });

    vapiRef.current.on('call-end', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      stopTimer();
      setIsSpeaking({user: false, assistant: false});
      setLiveTranscript({user: '', assistant: ''});
      addMessage('assistant', 'Interview session ended. Thank you for your time!');
    });

    vapiRef.current.on('speech-start', () => {
      setIsSpeaking(prev => ({...prev, assistant: true}));
    });

    vapiRef.current.on('speech-end', () => {
      setIsSpeaking(prev => ({...prev, assistant: false}));
    });

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript') {
        const content = message.transcript || '';
        const role = message.role;
        const transcriptType = message.transcriptType;

        if (content.trim()) {
          if (role === 'user') {
            if (transcriptType === 'partial') {
              setLiveTranscript(prev => ({...prev, user: content}));
              setIsSpeaking(prev => ({...prev, user: true}));
            } else {
              setLiveTranscript(prev => ({...prev, user: ''}));
              addMessage('user', content);
              setIsSpeaking(prev => ({...prev, user: false}));
            }
          } else if (role === 'assistant' || role === 'system') {
            if (transcriptType === 'partial') {
              setLiveTranscript(prev => ({...prev, assistant: content}));
            } else {
              setLiveTranscript(prev => ({...prev, assistant: ''}));
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
      setIsSpeaking({user: false, assistant: false});
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
    if (!vapiRef.current || !selectedAgent) {
      setError('Please select an interviewer first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConnectionStatus('Connecting...');
    setConversation([]);
    setSessionDuration(0);
    setLiveTranscript({user: '', assistant: ''});

    try {
      await vapiRef.current.start(selectedAgent.id);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const selectAgent = (agent: InterviewerAgent) => {
    setSelectedAgent(agent);
  };

  const backToSelection = () => {
    if (isConnected) {
      endInterview();
    }
    setShowAgentSelection(true);
    setSelectedAgent(null);
    setConversation([]);
    setError(null);
  };

  // Agent Selection Screen
  if (showAgentSelection) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your AI Interviewer
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Select from our expert AI interviewers, each specialized in different areas and speaking styles
            </p>
          </div>

          {/* Interviewer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/15 cursor-pointer group ${
                  selectedAgent?.id === interviewer.id ? 'ring-4 ring-blue-400 bg-white/20' : ''
                }`}
                onClick={() => selectAgent(interviewer)}
              >
                {/* Selection Indicator */}
                {selectedAgent?.id === interviewer.id && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}

                {/* Avatar */}
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${interviewer.color} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <img 
                    src={interviewer.avatarUrl} 
                    alt={interviewer.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                </div>

                {/* Info */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{interviewer.name}</h3>
                  <p className="text-blue-200 font-medium mb-3">{interviewer.title}</p>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    {interviewer.description}
                  </p>

                  {/* Accent */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Globe className="h-4 w-4 text-blue-300" />
                    <span className="text-blue-200 text-sm">{interviewer.accent}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 px-4">
                  <div className="text-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white font-bold">{interviewer.rating}</span>
                    </div>
                    <span className="text-blue-200 text-xs">Rating</span>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold mb-1">
                      {interviewer.interviews.toLocaleString()}
                    </div>
                    <span className="text-blue-200 text-xs">Interviews</span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="space-y-2">
                  <div className="text-blue-200 text-xs font-medium text-center mb-2">
                    Expertise:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {interviewer.expertise.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/20 text-blue-100 text-xs rounded-full border border-white/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {interviewer.expertise.length > 2 && (
                      <span className="px-3 py-1 bg-white/20 text-blue-100 text-xs rounded-full border border-white/30">
                        +{interviewer.expertise.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            {selectedAgent ? (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${selectedAgent.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}
                    >
                      <img 
                        src={selectedAgent.avatarUrl} 
                        alt={selectedAgent.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">{selectedAgent.name}</div>
                      <div className="text-blue-200 text-sm">{selectedAgent.title}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startInterview}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <Phone className="h-6 w-6" />
                  )}
                  <span>
                    {isLoading ? 'Connecting...' : `Start Interview with ${selectedAgent.name}`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <MessageSquare className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-200">Please select an interviewer to begin your session</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}


  // Main Interview Interface
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-slate-900 text-white flex flex-col`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={backToSelection}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors bg-slate-700 rounded-lg px-3 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Change Interviewer</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionStatus}
            </span>
          </div>
          
          {isConnected && selectedAgent && (
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${selectedAgent.color} rounded-lg flex items-center justify-center text-sm`}>
                {selectedAgent.avatar}
              </div>
              <span className="text-sm text-slate-300">
                Interviewing with {selectedAgent.name}
              </span>
            </div>
          )}
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatDuration(sessionDuration)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-2 rounded-lg transition-colors ${
              showTranscript ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle Transcript"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`${showTranscript ? 'flex-1' : 'w-full'} flex flex-col`}>
          {/* Participants Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* AI Interviewer */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedAgent && (
                  <div className={`w-32 h-32 bg-gradient-to-br ${selectedAgent.color} rounded-full flex items-center justify-center shadow-2xl text-4xl ${
                    isSpeaking.assistant ? 'animate-pulse ring-4 ring-green-400' : ''
                  }`}>
                    <img 
                      src={selectedAgent.avatarUrl} 
                      alt={selectedAgent.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              {/* AI Status */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isSpeaking.assistant ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isSpeaking.assistant ? 'Speaking...' : 'Listening'}
                </div>
              </div>
              
              {/* AI Label */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {selectedAgent?.name} (AI Interviewer)
                  </span>
                </div>
              </div>

              {/* Live AI Transcript */}
              {liveTranscript.assistant && (
                <div className="absolute bottom-16 left-4 right-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
                    <div className="text-green-400 text-xs font-medium mb-1">AI Speaking:</div>
                    <div className="text-white text-sm">{liveTranscript.assistant}</div>
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl ${
                  isSpeaking.user ? 'animate-pulse ring-4 ring-blue-400' : ''
                }`}>
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
              
              {/* User Status */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isSpeaking.user ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isSpeaking.user ? 'Speaking...' : 'Listening'}
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
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
              </div>

              {/* Live User Transcript */}
              {liveTranscript.user && (
                <div className="absolute bottom-16 left-4 right-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
                    <div className="text-blue-400 text-xs font-medium mb-1">You're saying:</div>
                    <div className="text-white text-sm">{liveTranscript.user}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                disabled={!isConnected}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-slate-700 hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
              </button>

              {/* Video Button */}
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-full transition-all duration-200 ${
                  !isVideoOn 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isVideoOn ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoOn ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6 text-white" />}
              </button>

              {/* Main Call Button */}
              {!isConnected ? (
                <button
                  onClick={startInterview}
                  disabled={isLoading}
                  className="p-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                  title="Start Interview"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <Phone className="h-6 w-6 text-white" />
                  )}
                </button>
              ) : (
                <button
                  onClick={endInterview}
                  disabled={isLoading}
                  className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                  title="End Interview"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <PhoneOff className="h-6 w-6 text-white" />
                  )}
                </button>
              )}

              {/* Share Screen Button */}
              <button
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-200"
                title="Share Screen"
              >
                <Monitor className="h-6 w-6 text-white" />
              </button>

              {/* Participants Button */}
              <button
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-200"
                title="Participants"
              >
                <Users className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Transcript Sidebar */}
        {showTranscript && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Live Transcript
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : selectedAgent 
                          ? `bg-gradient-to-br ${selectedAgent.color} text-white`
                          : 'bg-slate-600 text-white'
                    }`}>
                      {message.type === 'user' ? 'U' : selectedAgent?.avatar || 'AI'}
                    </div>
                    <span className="text-xs text-slate-400">
                      {message.type === 'user' ? 'You' : selectedAgent?.name || 'AI'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-200 ml-8 leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </div>
        )}
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
    </div>
  );
};

export default Interview;