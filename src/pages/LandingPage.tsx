import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Star, 
  Users, 
  Trophy, 
  BookOpen, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Quote,
  Award,
  Target,
  Brain,
  GraduationCap,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Mic,
  FileText,
  TrendingUp
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced AI tutors that adapt to your learning style and provide personalized educational experiences.'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Chat Learning',
      description: 'Learn through conversations with AI assistants that can explain complex topics in simple terms.'
    },
    {
      icon: Mic,
      title: 'Voice-Based Interviews',
      description: 'Practice interviews and presentations with AI interviewers to build confidence and skills.'
    },
    {
      icon: FileText,
      title: 'Smart Flashcards',
      description: 'AI-generated flashcards from your study materials for efficient memorization and review.'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Detailed analytics and insights to monitor your learning progress and identify areas for improvement.'
    },
    {
      icon: Shield,
      title: 'Safe Learning Environment',
      description: 'Secure platform with privacy protection and content moderation for focused learning.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      content: 'EduGem has revolutionized how I study. The AI tutors explain complex algorithms in ways I can actually understand!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'Medical Student',
      content: 'The voice interview practice helped me ace my medical school interviews. The AI feedback was incredibly detailed!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Education Professor',
      content: 'The adaptive learning technology in EduGem is impressive. It truly personalizes education for each student.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Learners' },
    { number: '1000+', label: 'Study Topics' },
    { number: '95%', label: 'Success Rate' },
    { number: '40+', label: 'Countries' }
  ];

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/landing" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduGem
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/landing" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                About
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/auth/signin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/auth/signup')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/landing"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button 
                  onClick={() => { navigate('/auth/signin'); setIsMenuOpen(false); }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { navigate('/auth/signup'); setIsMenuOpen(false); }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-pulse">
                <Star className="h-4 w-4 mr-2" />
                #1 AI-Powered Learning Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Learning with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
                  AI-Powered Education
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Experience the future of education with EduGem. Our advanced AI tutors, interactive learning tools, 
                and personalized study plans make learning more effective and engaging than ever before.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button 
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Learning Now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-lg" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">50,000+</span> students learning daily
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                  alt="Students learning with AI technology"
                  className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce animation-delay-2000">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduGem?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with proven educational methodologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-blue-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of learners who have transformed their education with EduGem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <Quote className="h-8 w-8 text-blue-500 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-md"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className="flex mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the future of education with AI-powered learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </button>
            <Link 
              to="/about"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">EduGem</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Transform your learning journey with AI-powered education technology.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-sm text-gray-400">
              <p>© 2024 EduGem. All rights reserved.</p>
              <p>Made with ❤️ for better education</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;