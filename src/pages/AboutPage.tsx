import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Heart, 
  Users, 
  Award, 
  Lightbulb, 
  Globe, 
  Rocket,
  Star,
  Mail,
  Linkedin,
  Github,
  User,
  GraduationCap,
  Menu,
  X,
  Brain,
  Zap,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const teamMembers = [
    {
      name: 'Rishi Singh',
      role: 'Team Leader & Full-Stack Developer',
      description: 'Visionary leader with 8+ years of experience in educational technology. Passionate about creating innovative AI-powered solutions that make learning accessible and engaging for everyone.',
      skills: ['Leadership', 'Full-Stack Development', 'AI Integration', 'Product Strategy'],
      image: '/Rishi.jpg',
      social: {
        email: 'rishi@edugem.com',
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: 'Armaan Patel',
      role: 'Backend Developer & AI Specialist',
      description: 'Expert developer specializing in scalable backend systems and AI integration. Brings technical excellence and innovative problem-solving to create robust educational platforms.',
      skills: ['Node.js', 'AI/ML', 'Database Design', 'API Development'],
      image: '/Armaan.jpg',
      social: {
        email: 'armaan@edugem.com',
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: 'Sushil',
      role: 'UI/UX Designer',
      description: 'Creative designer focused on user-centered design and creating intuitive, beautiful interfaces that enhance the learning experience and make education more accessible.',
      skills: ['UI/UX Design', 'User Research', 'Prototyping', 'Design Systems'],
      image: '/Sushil.jpg',
      social: {
        email: 'sushil@edugem.com',
        linkedin: '#',
        github: '#'
      }
    }
    
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly push the boundaries of educational technology to create groundbreaking AI-powered learning experiences.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our love for education and technology drives us to create products that truly make a difference in students\' lives.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We believe in the power of collaborative learning and building strong educational communities worldwide.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest quality in everything we do, from AI algorithms to user experience design.'
    }
  ];

  const achievements = [
    {
      year: '2023',
      title: 'Platform Launch',
      description: 'EduGem was born from a vision to revolutionize education through AI technology.',
      icon: Rocket
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Successfully integrated advanced AI tutors and personalized learning algorithms.',
      icon: Brain
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve 50,000+ students across 40+ countries worldwide.',
      icon: Globe
    },
    {
      year: '2024',
      title: 'Recognition',
      description: 'Recognized as a leading AI-powered educational platform with 95% student satisfaction.',
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Home
              </Link>
              <Link to="/about" className="text-blue-600 font-medium">
                About
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
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
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-blue-600 bg-blue-50 rounded-lg"
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link 
                  to="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EduGem</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to transform education by making learning as engaging and effective as possible through 
              cutting-edge AI technology and personalized learning experiences.
            </p>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop" 
              alt="EduGem AI-powered learning platform"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
          </div>
        </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  EduGem was founded in 2023 with a simple yet powerful vision: to make learning as personalized 
                  and effective as having a dedicated tutor for every student. Our founders, frustrated with 
                  traditional one-size-fits-all educational methods, saw an opportunity to leverage AI technology 
                  to create truly adaptive learning experiences.
                </p>
                <p>
                  What started as a small project has now grown into a comprehensive AI-powered educational platform 
                  serving thousands of students worldwide. We've proven that when artificial intelligence meets 
                  educational expertise, learning becomes more engaging, effective, and accessible to everyone.
                </p>
                <p>
                  Today, EduGem continues to push the boundaries of educational technology, incorporating advanced AI, 
                  voice interaction, and personalized learning paths to create the future of education.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                alt="AI-powered educational innovation"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Target className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              "To democratize quality education by creating AI-powered, personalized learning experiences 
              that adapt to each student's unique needs, learning style, and pace."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Achievements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Key Achievements
            </h2>
            <p className="text-xl text-gray-600">
              Milestones in our mission to transform education through AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <achievement.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {achievement.year}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate individuals behind EduGem's AI-powered learning revolution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                      <User className="h-20 w-20 text-white opacity-50" />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-sm opacity-75">Photo Coming Soon</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-blue-600 font-semibold mb-4">
                    {member.role}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {member.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <a 
                      href={`mailto:${member.social.email}`}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a 
                      href={member.social.linkedin}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-200"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a 
                      href={member.social.github}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-200"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Technology
            </h2>
            <p className="text-xl text-gray-600">
              Built with cutting-edge AI and modern web technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">AI & Machine Learning</h3>
              <p className="text-sm text-gray-600">Advanced AI models for personalized learning</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Processing</h3>
              <p className="text-sm text-gray-600">Instant feedback and adaptive responses</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Content Generation</h3>
              <p className="text-sm text-gray-600">AI-powered educational content creation</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Detailed learning progress tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be part of the educational revolution. Whether you're a student, educator, or lifelong learner, 
            there's a place for you in the EduGem community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth/signup"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block"
            >
              Get Started Today
            </Link>
            <Link 
              to="/landing"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 inline-block"
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

export default AboutPage;