import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, BookOpen, Code, Calculator, Atom, History, Globe, Brain, TrendingUp, Coffee, Hash, Shield, Zap, Server, Database, Layout, Palette, FlaskRound as Flask, Dna } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  category: string;
}

interface SubjectSection {
  id: string;
  title: string;
  description: string;
  subjects: Subject[];
}

const FlashcardSubjectSelection: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const iconMap = {
    'Code': Code,
    'Code2': Code,
    'Coffee': Coffee,
    'Hash': Hash,
    'Shield': Shield,
    'Zap': Zap,
    'Server': Server,
    'Database': Database,
    'Layout': Layout,
    'Palette': Palette,
    'Calculator': Calculator,
    'Atom': Atom,
    'Flask': Flask,
    'Dna': Dna,
    'BookOpen': BookOpen,
    'Brain': Brain,
    'TrendingUp': TrendingUp,
    'History': History,
    'Globe': Globe
  };

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
          totalLessons: 25,
          category: 'frontend'
        },
        {
          id: 'vue',
          name: 'Vue.js',
          description: 'Learn Vue.js framework, composition API, and reactive programming.',
          icon: 'Code',
          color: 'border-l-green-500',
          totalLessons: 22,
          category: 'frontend'
        },
        {
          id: 'angular',
          name: 'Angular',
          description: 'Build enterprise applications with Angular, TypeScript, and RxJS.',
          icon: 'Code',
          color: 'border-l-red-500',
          totalLessons: 28,
          category: 'frontend'
        },
        {
          id: 'html-css',
          name: 'HTML & CSS',
          description: 'Master semantic HTML, modern CSS, flexbox, and grid layouts.',
          icon: 'Layout',
          color: 'border-l-orange-500',
          totalLessons: 20,
          category: 'frontend'
        },
        {
          id: 'tailwind',
          name: 'Tailwind CSS',
          description: 'Learn utility-first CSS framework for rapid UI development.',
          icon: 'Palette',
          color: 'border-l-cyan-500',
          totalLessons: 15,
          category: 'frontend'
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
          totalLessons: 24,
          category: 'backend'
        },
        {
          id: 'nextjs',
          name: 'Next.js',
          description: 'Build full-stack applications with Next.js, SSR, and API routes.',
          icon: 'Code',
          color: 'border-l-gray-500',
          totalLessons: 18,
          category: 'backend'
        },
        {
          id: 'django',
          name: 'Django',
          description: 'Develop web applications with Python Django framework.',
          icon: 'Database',
          color: 'border-l-green-700',
          totalLessons: 26,
          category: 'backend'
        },
        {
          id: 'spring',
          name: 'Spring Boot',
          description: 'Build enterprise Java applications with Spring Boot.',
          icon: 'Zap',
          color: 'border-l-green-500',
          totalLessons: 30,
          category: 'backend'
        },
        {
          id: 'mongodb',
          name: 'MongoDB',
          description: 'Master NoSQL database design and operations with MongoDB.',
          icon: 'Database',
          color: 'border-l-green-600',
          totalLessons: 18,
          category: 'backend'
        },
        {
          id: 'postgresql',
          name: 'PostgreSQL',
          description: 'Learn advanced SQL and database management with PostgreSQL.',
          icon: 'Database',
          color: 'border-l-blue-600',
          totalLessons: 22,
          category: 'backend'
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
          icon: 'Code',
          color: 'border-l-yellow-500',
          totalLessons: 32,
          category: 'programming'
        },
        {
          id: 'typescript',
          name: 'TypeScript',
          description: 'Learn TypeScript fundamentals, advanced types, and integration patterns.',
          icon: 'Code',
          color: 'border-l-blue-600',
          totalLessons: 20,
          category: 'programming'
        },
        {
          id: 'python',
          name: 'Python',
          description: 'Learn Python programming, data structures, and object-oriented concepts.',
          icon: 'Code',
          color: 'border-l-blue-500',
          totalLessons: 28,
          category: 'programming'
        },
        {
          id: 'java',
          name: 'Java',
          description: 'Master Java programming, OOP principles, and enterprise development.',
          icon: 'Coffee',
          color: 'border-l-red-600',
          totalLessons: 35,
          category: 'programming'
        },
        {
          id: 'cpp',
          name: 'C++',
          description: 'Learn C++ programming, memory management, and system programming.',
          icon: 'Code',
          color: 'border-l-blue-700',
          totalLessons: 30,
          category: 'programming'
        },
        {
          id: 'csharp',
          name: 'C#',
          description: 'Develop applications with C# and .NET framework.',
          icon: 'Hash',
          color: 'border-l-purple-600',
          totalLessons: 26,
          category: 'programming'
        },
        {
          id: 'go',
          name: 'Go',
          description: 'Learn Go programming for concurrent and distributed systems.',
          icon: 'Zap',
          color: 'border-l-cyan-600',
          totalLessons: 22,
          category: 'programming'
        },
        {
          id: 'rust',
          name: 'Rust',
          description: 'Master systems programming with Rust, memory safety, and performance.',
          icon: 'Shield',
          color: 'border-l-orange-600',
          totalLessons: 24,
          category: 'programming'
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
          totalLessons: 40,
          category: 'academic'
        },
        {
          id: 'physics',
          name: 'Physics',
          description: 'Understand mechanics, thermodynamics, electromagnetism, and quantum physics.',
          icon: 'Atom',
          color: 'border-l-blue-500',
          totalLessons: 35,
          category: 'academic'
        },
        {
          id: 'chemistry',
          name: 'Chemistry',
          description: 'Learn organic, inorganic chemistry, and chemical reactions.',
          icon: 'Flask',
          color: 'border-l-green-500',
          totalLessons: 32,
          category: 'academic'
        },
        {
          id: 'biology',
          name: 'Biology',
          description: 'Explore life sciences, genetics, ecology, and human anatomy.',
          icon: 'Dna',
          color: 'border-l-emerald-500',
          totalLessons: 38,
          category: 'academic'
        },
        {
          id: 'history',
          name: 'History',
          description: 'Explore world history, civilizations, and historical events.',
          icon: 'History',
          color: 'border-l-amber-500',
          totalLessons: 30,
          category: 'academic'
        },
        {
          id: 'geography',
          name: 'Geography',
          description: 'Study world geography, countries, capitals, and physical features.',
          icon: 'Globe',
          color: 'border-l-green-500',
          totalLessons: 22,
          category: 'academic'
        },
        {
          id: 'literature',
          name: 'Literature',
          description: 'Analyze classic and modern literature, poetry, and literary techniques.',
          icon: 'BookOpen',
          color: 'border-l-purple-500',
          totalLessons: 28,
          category: 'academic'
        },
        {
          id: 'philosophy',
          name: 'Philosophy',
          description: 'Explore philosophical concepts, ethics, logic, and critical thinking.',
          icon: 'Brain',
          color: 'border-l-violet-500',
          totalLessons: 25,
          category: 'academic'
        },
        {
          id: 'economics',
          name: 'Economics',
          description: 'Understand microeconomics, macroeconomics, and market principles.',
          icon: 'TrendingUp',
          color: 'border-l-yellow-600',
          totalLessons: 24,
          category: 'academic'
        },
        {
          id: 'psychology',
          name: 'Psychology',
          description: 'Study human behavior, cognitive processes, and psychological theories.',
          icon: 'Brain',
          color: 'border-l-pink-500',
          totalLessons: 26,
          category: 'academic'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Subjects', count: subjectSections.reduce((total, section) => total + section.subjects.length, 0) },
    { id: 'frontend', name: 'Frontend', count: subjectSections.find(s => s.id === 'frontend')?.subjects.length || 0 },
    { id: 'backend', name: 'Backend', count: subjectSections.find(s => s.id === 'backend')?.subjects.length || 0 },
    { id: 'programming', name: 'Programming', count: subjectSections.find(s => s.id === 'programming')?.subjects.length || 0 },
    { id: 'academic', name: 'Academic', count: subjectSections.find(s => s.id === 'academic')?.subjects.length || 0 }
  ];

  const allSubjects = subjectSections.flatMap(section => section.subjects);
  
  const filteredSubjects = allSubjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubjectSelect = (subjectId: string) => {
    navigate(`/flashcards/setup/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Choose Your Subject
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select a subject to create AI-powered flashcards tailored to your learning goals
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => {
            const Icon = iconMap[subject.icon as keyof typeof iconMap] || BookOpen;
            
            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject.id)}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${subject.color} overflow-hidden text-left group`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${subject.color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
                      <Icon className={`h-6 w-6 ${subject.color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Create Flashcards</span>
                    <span>{subject.totalLessons} topics available</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSubjects.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filter
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Subject-Based Flashcards?</h2>
            <p className="text-gray-600">AI-powered learning tailored to each subject's unique requirements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {subjectSections.reduce((total, section) => total + section.subjects.length, 0)}+
              </div>
              <div className="text-sm text-blue-800">Subjects Available</div>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-sm text-green-800">Powered Generation</div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-2">Smart</div>
              <div className="text-sm text-purple-800">Adaptive Learning</div>
            </div>
            
            <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-2">Track</div>
              <div className="text-sm text-orange-800">Progress & Stats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardSubjectSelection;