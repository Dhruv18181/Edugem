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
  Code,
  BookOpen,
  Calculator,
  Globe
} from 'lucide-react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    {
      icon: Code,
      title: "Code Help",
      prompt: "Help me write a Java function to sort an array",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: BookOpen,
      title: "Explain Concept",
      prompt: "Explain React hooks with examples",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: Calculator,
      title: "Math Problem",
      prompt: "Solve this calculus problem step by step",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      icon: Globe,
      title: "General Knowledge",
      prompt: "Tell me about the history of artificial intelligence",
      color: "bg-orange-50 text-orange-700 border-orange-200"
    }
  ];

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
      const response = await geminiService.chatWithAI(textToSend, selectedImage || undefined);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      storageService.saveChatMessage(aiMessage);
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EduGem AI</h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Your intelligent learning companion. Ask questions, upload images, get code help, or explore any topic you're curious about.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.prompt)}
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200 text-left ${prompt.color}`}
                  >
                    <prompt.icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">{prompt.title}</div>
                      <div className="text-sm opacity-80">{prompt.prompt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-4xl ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    
                    <div className={`rounded-2xl px-6 py-4 max-w-3xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    }`}>
                      {message.image && (
                        <div className="mb-3">
                          <img 
                            src={message.image} 
                            alt="Uploaded" 
                            className="max-w-sm rounded-lg shadow-md"
                          />
                        </div>
                      )}
                      
                      {message.type === 'ai' ? (
                        <MessageRenderer content={message.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                      
                      <div className={`text-xs mt-3 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-4xl">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {selectedImage && (
            <div className="mb-4 relative inline-block">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-w-32 h-20 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              title="Upload Image"
            >
              <Upload className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                rows={1}
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || (!inputText.trim() && !selectedImage)}
                className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>EduGem AI can make mistakes. Consider checking important information.</span>
            <span>{inputText.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;