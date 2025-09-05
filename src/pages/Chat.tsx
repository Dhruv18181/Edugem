import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../utils/gemini';
import { storageService } from '../utils/storage';
import MessageRenderer from '../components/MessageRenderer';
import { 
  Send, 
  Bot, 
  User, 
  Upload, 
  X, 
  Sparkles,
  BookOpen,
  Search,
  Zap,
  Plus,
  Paperclip,
  Globe,
  Youtube,
  ExternalLink,
  Loader2,
  ChevronDown,
  Volume2,
  VolumeX
} from 'lucide-react';

interface SearchMode {
  id: 'chat' | 'study' | 'web' | 'deep';
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode['id']>('chat');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isReading, setIsReading] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const searchModes: SearchMode[] = [
    {
      id: 'chat',
      name: 'Chat',
      icon: Sparkles,
      description: 'General AI conversation',
      color: 'text-blue-600'
    },
    {
      id: 'study',
      name: 'Study & Learn',
      icon: BookOpen,
      description: 'Educational assistance and tutoring',
      color: 'text-green-600'
    },
    {
      id: 'web',
      name: 'Web Search',
      icon: Globe,
      description: 'Search the web for current information',
      color: 'text-purple-600'
    },
    {
      id: 'deep',
      name: 'Deep Research',
      icon: Zap,
      description: 'In-depth analysis and research',
      color: 'text-orange-600'
    }
  ];

  const currentMode = searchModes.find(mode => mode.id === searchMode) || searchModes[0];

  useEffect(() => {
    const history = storageService.getChatHistory();
    setMessages(history);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readAloud = (text: string, messageId: string) => {
    if (!speechSynthesisRef.current) return;

    if (isReading === messageId) {
      speechSynthesisRef.current.cancel();
      setIsReading(null);
      return;
    }

    speechSynthesisRef.current.cancel();
    
    // Clean text for speech synthesis
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/```[\s\S]*?```/g, 'code block')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsReading(messageId);
    utterance.onend = () => setIsReading(null);
    utterance.onerror = () => setIsReading(null);

    speechSynthesisRef.current.speak(utterance);
  };

  const typewriterEffect = (text: string, messageId: string, speed: number = 20) => {
    let index = 0;
    setTypewriterText(prev => ({ ...prev, [messageId]: '' }));
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypewriterText(prev => ({
          ...prev,
          [messageId]: text.slice(0, index + 1)
        }));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    storageService.saveChatMessage(userMessage);

    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    try {
      let response = '';
      
      if (searchMode === 'web') {
        const webPrompt = `Please search the web for current information about: ${textToSend}. Provide a comprehensive answer with relevant links.`;
        response = await geminiService.chatWithAI(webPrompt, selectedImage || undefined);
      } else if (searchMode === 'study') {
        const studyPrompt = `As an educational tutor, please help with this learning request: ${textToSend}. Provide detailed explanations, examples, and educational resources.`;
        response = await geminiService.chatWithAI(studyPrompt, selectedImage || undefined);
      } else if (searchMode === 'deep') {
        const deepPrompt = `Provide a comprehensive, in-depth analysis of: ${textToSend}. Include multiple perspectives, detailed explanations, and thorough research.`;
        response = await geminiService.chatWithAI(deepPrompt, selectedImage || undefined);
      } else {
        response = await geminiService.chatWithAI(textToSend, selectedImage || undefined);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      storageService.saveChatMessage(aiMessage);
      
      // Start typewriter effect for AI response
      typewriterEffect(response, aiMessage.id);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      storageService.saveChatMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    {
      icon: BookOpen,
      title: "Explain quantum physics",
      prompt: "Explain quantum physics in simple terms with examples"
    },
    {
      icon: Search,
      title: "Latest AI news",
      prompt: "What are the latest developments in artificial intelligence?"
    },
    {
      icon: Sparkles,
      title: "Creative writing",
      prompt: "Help me write a creative story about space exploration"
    },
    {
      icon: Zap,
      title: "Problem solving",
      prompt: "Help me solve this complex math problem step by step"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <currentMode.icon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  How can I help you today?
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Choose a mode and start chatting. I can help with learning, research, web search, and more.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-8">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="flex items-start space-x-4 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left bg-white group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <prompt.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{prompt.title}</div>
                      <div className="text-sm text-gray-600">{prompt.prompt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-4 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    
                    <div className={`flex-1 max-w-3xl ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      {/* Read Aloud Button for AI messages */}
                      {message.type === 'ai' && (
                        <div className={`mb-2 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                          <button
                            onClick={() => readAloud(message.content, message.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              isReading === message.id
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isReading === message.id ? (
                              <>
                                <VolumeX className="h-3 w-3" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {message.image && (
                        <div className={`mb-3 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                          <img 
                            src={message.image} 
                            alt="Uploaded" 
                            className="max-w-sm rounded-xl shadow-md"
                          />
                        </div>
                      )}
                      
                      <div className={`inline-block max-w-full ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-3xl px-6 py-3'
                          : 'text-gray-900'
                      }`}>
                        {message.type === 'ai' ? (
                          <MessageRenderer 
                            content={typewriterText[message.id] !== undefined 
                              ? typewriterText[message.id] 
                              : message.content
                            } 
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
                      
                      <div className={`text-xs text-gray-500 mt-2 ${
                        message.type === 'user' ? 'text-right' : ''
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {selectedImage && (
            <div className="mb-4 relative inline-block">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-w-32 h-20 object-cover rounded-xl shadow-md"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <div className="relative">
            {/* Mode Selector */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <div className="relative">
                <button
                  onClick={() => setShowModeSelector(!showModeSelector)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors ${currentMode.color}`}
                >
                  <currentMode.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentMode.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                
                {showModeSelector && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 min-w-64 z-20">
                    {searchModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setSearchMode(mode.id);
                          setShowModeSelector(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          searchMode === mode.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <mode.icon className={`h-5 w-5 ${mode.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{mode.name}</div>
                          <div className="text-xs text-gray-500">{mode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Input Field */}
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message EduGem..."
                  rows={1}
                  className="w-full pl-32 pr-20 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-48 text-gray-900 placeholder-gray-500"
                />
                
                {/* Right side buttons */}
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Upload Image"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || (!inputText.trim() && !selectedImage)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center text-xs text-gray-500 mt-3">
            <span>EduGem can make mistakes. Consider checking important information.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;