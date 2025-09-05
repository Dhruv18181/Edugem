import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  MessageCircle, 
  BarChart3, 
  BookOpen, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  MessageSquare,
  Mic,
  GraduationCap,
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile overlay on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview and stats'
    },
    { 
      path: '/chat', 
      label: 'AI Chat', 
      icon: MessageCircle,
      description: 'Chat with AI assistant'
    },
    { 
      path: '/interview', 
      label: 'Voice Interview', 
      icon: Mic,
      description: 'Practice with AI interviewer'
    },
    { 
      path: '/voice-learning', 
      label: 'Voice Learning', 
      icon: GraduationCap,
      description: 'AI tutor for any subject'
    },
    { 
      path: '/progress', 
      label: 'Progress', 
      icon: BarChart3,
      description: 'Track your learning'
    }
  ];

  const clearChat = () => {
    // Clear chat history
    localStorage.removeItem('eduplatform_chat');
    if (location.pathname === '/chat') {
      window.location.reload();
    }
  };

  const startNewChat = () => {
    clearChat();
    navigate('/chat');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
              isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
            }`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduGem</span>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map(({ path, label, icon: Icon, description }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium 
                  transition-all duration-200 group relative
                  ${location.pathname === path
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className={`transition-opacity duration-200 ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
                }`}>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Chat Actions (only show when on chat page) */}
          {location.pathname === '/chat' && (
            <div className={`px-4 py-4 border-t border-gray-200 space-y-2 ${
              isCollapsed ? 'lg:px-2' : ''
            }`}>
              <button
                onClick={startNewChat}
                className={`
                  w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 
                  text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
                }`}>
                  New Chat
                </span>
              </button>
              
              <button
                onClick={clearChat}
                className={`
                  w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 
                  px-3 py-2 rounded-lg transition-colors text-sm
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
              >
                <Trash2 className="h-4 w-4 flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
                }`}>
                  Clear Chat
                </span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200">
            {/* User Profile Section */}
            <div className={`p-4 ${isCollapsed ? 'lg:px-2' : ''}`}>
              <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Collapsed state user indicator */}
              {isCollapsed && (
                <div className="hidden lg:flex justify-center mb-4">
                  <div className="relative group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Features Badge */}
            <div className={`px-4 pb-4 ${isCollapsed ? 'lg:px-2' : ''}`}>
              <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800">PREMIUM</span>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Powered by advanced AI technology for personalized learning
                  </p>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className={`px-4 pb-4 ${isCollapsed ? 'lg:px-2' : ''}`}>
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center space-x-3 bg-red-50 hover:bg-red-100 
                  text-red-600 hover:text-red-700 px-4 py-3 rounded-xl 
                  transition-all duration-200 border border-red-200 hover:border-red-300
                  font-medium shadow-sm hover:shadow-md group
                  ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}
                `}
              >
                <LogOut className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span className={`text-sm transition-opacity duration-200 ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
                }`}>
                  Sign Out
                </span>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Sign Out
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">EduGem</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;