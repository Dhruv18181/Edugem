import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Subject, UserProgress } from '../types';
import { storageService } from '../utils/storage';
import SubjectCard from '../components/SubjectCard';
import { BookOpen, TrendingUp, Award, Clock, ChevronDown, ChevronUp, Sparkles, GraduationCap, Upload, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flashcardStorage } from '../utils/flashcardStorage';

interface SubjectSection {
  id: string;
  title: string;
  description: string;
  subjects: Subject[];
}

const subjectSections: SubjectSection[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Master modern frontend technologies and frameworks',
    subjects: [
      {
        id: 'react',
        name: 'React Development',
        description: 'Master modern React development with hooks, context, and best practices.',
        icon: 'Code',
        color: 'border-l-blue-500',
        totalLessons: 25
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'Learn Vue.js framework, composition API, and reactive programming.',
        icon: 'Code',
        color: 'border-l-green-500',
        totalLessons: 22
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'Build enterprise applications with Angular, TypeScript, and RxJS.',
        icon: 'Code',
        color: 'border-l-red-500',
        totalLessons: 28
      },
      {
        id: 'html-css',
        name: 'HTML & CSS',
        description: 'Master semantic HTML, modern CSS, flexbox, and grid layouts.',
        icon: 'Layout',
        color: 'border-l-orange-500',
        totalLessons: 20
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        description: 'Learn utility-first CSS framework for rapid UI development.',
        icon: 'Palette',
        color: 'border-l-cyan-500',
        totalLessons: 15
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Build robust server-side applications and APIs',
    subjects: [
      {
        id: 'nodejs',
        name: 'Node.js',
        description: 'Build scalable server-side applications with Node.js and Express.',
        icon: 'Server',
        color: 'border-l-green-600',
        totalLessons: 24
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'Build full-stack applications with Next.js, SSR, and API routes.',
        icon: 'Layers',
        color: 'border-l-gray-500',
        totalLessons: 18
      },
      {
        id: 'django',
        name: 'Django',
        description: 'Develop web applications with Python Django framework.',
        icon: 'Database',
        color: 'border-l-green-700',
        totalLessons: 26
      },
      {
        id: 'spring',
        name: 'Spring Boot',
        description: 'Build enterprise Java applications with Spring Boot.',
        icon: 'Zap',
        color: 'border-l-green-500',
        totalLessons: 30
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        description: 'Master NoSQL database design and operations with MongoDB.',
        icon: 'Database',
        color: 'border-l-green-600',
        totalLessons: 18
      },
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        description: 'Learn advanced SQL and database management with PostgreSQL.',
        icon: 'Database',
        color: 'border-l-blue-600',
        totalLessons: 22
      }
    ]
  },
  {
    id: 'programming',
    title: 'Programming Languages',
    description: 'Master core programming languages and concepts',
    subjects: [
      {
        id: 'javascript',
        name: 'JavaScript',
        description: 'Master modern JavaScript, ES6+, async programming, and DOM manipulation.',
        icon: 'Code2',
        color: 'border-l-yellow-500',
        totalLessons: 32
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Learn TypeScript fundamentals, advanced types, and integration patterns.',
        icon: 'file-code',
        color: 'border-l-blue-600',
        totalLessons: 20
      },
      {
        id: 'python',
        name: 'Python',
        description: 'Learn Python programming, data structures, and object-oriented concepts.',
        icon: 'Code2',
        color: 'border-l-blue-500',
        totalLessons: 28
      },
      {
        id: 'java',
        name: 'Java',
        description: 'Master Java programming, OOP principles, and enterprise development.',
        icon: 'Coffee',
        color: 'border-l-red-600',
        totalLessons: 35
      },
      {
        id: 'cpp',
        name: 'C++',
        description: 'Learn C++ programming, memory management, and system programming.',
        icon: 'Code2',
        color: 'border-l-blue-700',
        totalLessons: 30
      },
      {
        id: 'csharp',
        name: 'C#',
        description: 'Develop applications with C# and .NET framework.',
        icon: 'Hash',
        color: 'border-l-purple-600',
        totalLessons: 26
      },
      {
        id: 'go',
        name: 'Go',
        description: 'Learn Go programming for concurrent and distributed systems.',
        icon: 'Zap',
        color: 'border-l-cyan-600',
        totalLessons: 22
      },
      {
        id: 'rust',
        name: 'Rust',
        description: 'Master systems programming with Rust, memory safety, and performance.',
        icon: 'Shield',
        color: 'border-l-orange-600',
        totalLessons: 24
      }
    ]
  },
  {
    id: 'academic',
    title: 'Academic Studies',
    description: 'Explore traditional academic subjects and expand your knowledge',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Master algebra, calculus, statistics, and mathematical reasoning.',
        icon: 'Calculator',
        color: 'border-l-indigo-500',
        totalLessons: 40
      },
      {
        id: 'physics',
        name: 'Physics',
        description: 'Understand mechanics, thermodynamics, electromagnetism, and quantum physics.',
        icon: 'Atom',
        color: 'border-l-blue-500',
        totalLessons: 35
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Learn organic, inorganic chemistry, and chemical reactions.',
        icon: 'Flask',
        color: 'border-l-green-500',
        totalLessons: 32
      },
      {
        id: 'biology',
        name: 'Biology',
        description: 'Explore life sciences, genetics, ecology, and human anatomy.',
        icon: 'Dna',
        color: 'border-l-emerald-500',
        totalLessons: 38
      },
      {
        id: 'history',
        name: 'History',
        description: 'Explore world history, civilizations, and historical events.',
        icon: 'History',
        color: 'border-l-amber-500',
        totalLessons: 30
      },
      {
        id: 'geography',
        name: 'Geography',
        description: 'Study world geography, countries, capitals, and physical features.',
        icon: 'Globe',
        color: 'border-l-green-500',
        totalLessons: 22
      },
      {
        id: 'literature',
        name: 'Literature',
        description: 'Analyze classic and modern literature, poetry, and literary techniques.',
        icon: 'BookOpen',
        color: 'border-l-purple-500',
        totalLessons: 28
      },
      {
        id: 'philosophy',
        name: 'Philosophy',
        description: 'Explore philosophical concepts, ethics, logic, and critical thinking.',
        icon: 'Brain',
        color: 'border-l-violet-500',
        totalLessons: 25
      },
      {
        id: 'economics',
        name: 'Economics',
        description: 'Understand microeconomics, macroeconomics, and market principles.',
        icon: 'TrendingUp',
        color: 'border-l-yellow-600',
        totalLessons: 24
      },
      {
        id: 'psychology',
        name: 'Psychology',
        description: 'Study human behavior, cognitive processes, and psychological theories.',
        icon: 'Brain',
        color: 'border-l-pink-500',
        totalLessons: 26
      }
    ]
  }
];

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frontend: true,
    backend: false,
    programming: false,
    academic: false
  });
  const [flashcardStats, setFlashcardStats] = useState({
    totalSets: 0,
    totalCards: 0,
    recentSets: [] as any[]
  });
  const [stats, setStats] = useState({
    totalSubjects: subjectSections.reduce((total, section) => total + section.subjects.length, 0),
    completedLessons: 0,
    averageScore: 0,
    streak: 0
  });

  useEffect(() => {
    const progress = storageService.getUserProgress();
    setUserProgress(progress);
    
    // Load flashcard statistics
    const flashcardSets = flashcardStorage.getFlashcardSets();
    const overallStats = flashcardStorage.getOverallStats();
    setFlashcardStats({
      totalSets: overallStats.totalSets,
      totalCards: overallStats.totalCards,
      recentSets: flashcardSets.slice(-3).reverse()
    });
    
    // Calculate stats
    const completedLessons = Object.values(progress).reduce(
      (sum, p) => sum + p.completedQuestions, 0
    );
    
    const allScores = Object.values(progress).flatMap(p => p.sessionScores);
    const averageScore = allScores.length 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0;
    
    setStats({
      totalSubjects: subjectSections.reduce((total, section) => total + section.subjects.length, 0),
      completedLessons,
      averageScore: Math.round(averageScore),
      streak: Object.keys(progress).length
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]; // Get first name
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Student';
  };
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{getUserName()}</span>! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Continue your learning journey with AI-powered education
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Premium Account</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedLessons}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Flashcard Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Flashcard Learning</h2>
                    <p className="text-gray-600 text-sm">Create and study with AI-generated flashcards</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{flashcardStats.totalSets}</div>
                    <div className="text-xs text-gray-500">Sets Created</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Create from Subject */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Subject-Based Learning</h3>
                      <p className="text-gray-600 text-sm">Choose a subject and specify topics</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Select any subject from our curriculum and specify the exact topics you want to learn. 
                    Our AI will generate comprehensive flashcards tailored to your needs.
                  </p>
                  <div className="text-sm text-gray-600 mb-4">
                    ✓ 20+ subjects available<br/>
                    ✓ Customizable difficulty levels<br/>
                    ✓ Topic-specific content
                  </div>
                  <Link
                    to="/flashcards/create"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Create Flashcards</span>
                  </Link>
                </div>

                {/* Custom Upload */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Custom Materials</h3>
                      <p className="text-gray-600 text-sm">Upload your own study materials</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Upload images, PDFs, or text files of your syllabus, notes, or textbooks. 
                    Our AI will extract key topics and create personalized flashcards.
                  </p>
                  <div className="text-sm text-gray-600 mb-4">
                    ✓ Support for JPG, PNG, PDF, TXT<br/>
                    ✓ OCR text extraction<br/>
                    ✓ Automatic topic detection
                  </div>
                  <Link
                    to="/flashcards/custom"
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Materials</span>
                  </Link>
                </div>
              </div>

              {/* Recent Flashcard Sets */}
              {flashcardStats.recentSets.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Flashcard Sets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {flashcardStats.recentSets.map((set) => (
                      <Link
                        key={set.id}
                        to={`/study/${set.id}`}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {set.title}
                          </h4>
                          <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{set.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{set.totalCards} cards</span>
                          <span className="capitalize">{set.difficulty}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{flashcardStats.totalSets}</div>
                  <div className="text-sm text-gray-600">Total Sets</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{flashcardStats.totalCards}</div>
                  <div className="text-sm text-gray-600">Total Cards</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {flashcardStats.recentSets.filter(set => set.lastStudied).length}
                  </div>
                  <div className="text-sm text-gray-600">Studied Sets</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {flashcardStats.recentSets.reduce((sum, set) => sum + set.masteredCards, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Mastered Cards</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Path</h2>
          <div className="space-y-8">
            {subjectSections.map(section => (
              <div key={section.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{section.title}</h3>
                    <p className="text-gray-600 text-sm">{section.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {section.subjects.length} subjects
                    </span>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {expandedSections[section.id] && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.subjects.map(subject => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          progress={userProgress[subject.id]}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors">
              <BookOpen className="h-4 w-4" />
              <span>Continue Last Session</span>
            </button>
            <button className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors">
              <Award className="h-4 w-4" />
              <span>Take Assessment</span>
            </button>
            <button className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>View Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;