import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../utils/flashcardService';
import { flashcardStorage } from '../utils/flashcardStorage';
import { FlashcardSet } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  BookOpen, 
  Target, 
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  Image,
  File,
  Settings,
  Lightbulb,
  Zap
} from 'lucide-react';

const FlashcardSetup: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [cardCount, setCardCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);

  const subjectNames: Record<string, string> = {
    react: 'React Development',
    vue: 'Vue.js',
    angular: 'Angular',
    'html-css': 'HTML & CSS',
    tailwind: 'Tailwind CSS',
    nodejs: 'Node.js',
    nextjs: 'Next.js',
    django: 'Django',
    spring: 'Spring Boot',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    mathematics: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    history: 'History',
    geography: 'Geography',
    literature: 'Literature',
    philosophy: 'Philosophy',
    economics: 'Economics',
    psychology: 'Psychology'
  };

  const subjectName = subjectId ? subjectNames[subjectId] || subjectId : 'Custom Subject';
  const isCustomMode = !subjectId || subjectId === 'custom'; // Custom mode when no subjectId or custom subjectId

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload JPG, PNG, PDF, or TXT files only');
        return;
      }

      setUploadFile(file);
      setError(null);
    }
  };

  const processUploadedFile = async () => {
    if (!uploadFile) return;

    setLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await flashcardService.processCustomUpload(uploadFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setExtractedContent(result.content);
      setExtractedTopics(result.topics);
      setTopics(result.topics);
      
      setTimeout(() => {
        setShowCustomUpload(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to process uploaded file');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (topics.length === 0) {
      setError('Please add at least one topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let flashcards;
      
      if (extractedContent) {
        // Generate from uploaded content
        flashcards = await flashcardService.generateFlashcardsFromContent(
          extractedContent,
          topics,
          subjectName,
          difficulty,
          cardCount
        );
      } else {
        // Generate from topics
        flashcards = await flashcardService.generateFlashcards(
          subjectName,
          topics,
          difficulty,
          cardCount
        );
      }

      // Create flashcard set
      const flashcardSet: FlashcardSet = {
        id: `set-${Date.now()}`,
        title: `${subjectName} - ${topics.join(', ')}`,
        description: `Flashcards covering ${topics.join(', ')} at ${difficulty} level`,
        subject: subjectName,
        topics,
        flashcards,
        createdAt: new Date(),
        totalCards: flashcards.length,
        masteredCards: 0,
        difficulty,
        isCustom: !!extractedContent,
        sourceFile: uploadFile?.name
      };

      // Save to storage
      flashcardStorage.saveFlashcardSet(flashcardSet);

      // Navigate to study page
      navigate(`/study/${flashcardSet.id}`);
      
    } catch (error: any) {
      setError(error.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
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
              Create Flashcards
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isCustomMode 
                ? 'Upload your study materials or specify topics to generate personalized flashcards'
                : `Generate AI-powered flashcards for ${subjectName}`
              }
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-8">
              {/* Custom Upload Section - Only show in custom mode */}
              {isCustomMode && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                          <Upload className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Upload Study Materials</h2>
                          <p className="text-gray-600">Upload images, PDFs, or text files to extract topics automatically</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCustomUpload(!showCustomUpload)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          showCustomUpload 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showCustomUpload ? 'Hide Upload' : 'Show Upload'}
                      </button>
                    </div>
                  </div>

                  {showCustomUpload && (
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <Image className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="font-medium text-blue-900">Images</div>
                          <div className="text-sm text-blue-700">JPG, PNG</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                          <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="font-medium text-green-900">Documents</div>
                          <div className="text-sm text-green-700">PDF, TXT</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <div className="font-medium text-orange-900">AI Processing</div>
                          <div className="text-sm text-orange-700">Auto extraction</div>
                        </div>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors bg-gray-50 hover:bg-purple-50">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-2xl font-semibold text-gray-900 mb-2">
                            Drop your files here
                          </p>
                          <p className="text-lg text-gray-600 mb-4">
                            or click to browse
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports JPG, PNG, PDF, and TXT files up to 10MB
                          </p>
                        </label>
                      </div>

                      {uploadFile && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-center space-x-4 mb-4">
                            {React.createElement(getFileIcon(uploadFile), { className: "h-8 w-8 text-blue-600" })}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">{uploadFile.name}</p>
                              <p className="text-gray-600">
                                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => setUploadFile(null)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          {uploadProgress > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-700 mb-2">
                                <span>Processing file...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={processUploadedFile}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                          >
                            {loading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5" />
                                <span>Process with AI</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Topics Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Learning Topics</h2>
                      <p className="text-gray-600">
                        {extractedContent 
                          ? 'Topics extracted from your file. Add or remove as needed.'
                          : 'Specify the topics you want to master with flashcards'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex space-x-3 mb-6">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                      placeholder="e.g., React Hooks, State Management, Component Lifecycle"
                      className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
                    />
                    <button
                      onClick={addTopic}
                      className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {topics.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium text-gray-700">Your Topics ({topics.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topics.map((topic, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl group hover:shadow-md transition-all duration-200"
                          >
                            <span className="font-medium text-gray-900 flex-1">{topic}</span>
                            <button
                              onClick={() => removeTopic(topic)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No topics added yet</p>
                      <p className="text-gray-400">Add topics above to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Flashcard Settings</h2>
                      <p className="text-gray-600">Customize your learning experience</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Difficulty Level
                      </label>
                      <div className="space-y-3">
                        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                          <label
                            key={level}
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              difficulty === level
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="difficulty"
                              value={level}
                              checked={difficulty === level}
                              onChange={(e) => setDifficulty(e.target.value as any)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              difficulty === level ? 'border-green-500' : 'border-gray-300'
                            }`}>
                              {difficulty === level && (
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 capitalize">{level}</div>
                              <div className="text-sm text-gray-600">
                                {level === 'beginner' && 'Basic concepts and definitions'}
                                {level === 'intermediate' && 'Detailed explanations and examples'}
                                {level === 'advanced' && 'Complex scenarios and applications'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Number of Cards
                      </label>
                      <div className="space-y-4">
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={cardCount}
                          onChange={(e) => setCardCount(parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>5 cards</span>
                          <span className="font-semibold text-lg text-gray-900">{cardCount} cards</span>
                          <span>50 cards</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 text-sm">
                            <strong>Recommended:</strong> 15-25 cards for optimal learning sessions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={generateFlashcards}
                  disabled={loading || topics.length === 0}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-xl"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                  <span>{loading ? 'Generating...' : 'Generate Flashcards'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Preview Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Preview</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">Subject</div>
                      <div className="font-semibold text-gray-900">{subjectName}</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">Topics ({topics.length})</div>
                      <div className="text-sm text-gray-900">
                        {topics.length > 0 ? (
                          <div className="space-y-1">
                            {topics.slice(0, 3).map((topic, index) => (
                              <div key={index} className="truncate">• {topic}</div>
                            ))}
                            {topics.length > 3 && (
                              <div className="text-gray-500">+{topics.length - 3} more</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No topics added yet</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">Settings</div>
                      <div className="text-sm text-gray-900 space-y-1">
                        <div>Difficulty: <span className="capitalize font-medium">{difficulty}</span></div>
                        <div>Cards: <span className="font-medium">{cardCount}</span></div>
                        {extractedContent && <div className="text-green-600">✓ Custom Upload</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Indicator */}
                {extractedTopics.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="font-semibold text-green-800">File Processed!</div>
                    </div>
                    <div className="text-sm text-green-700">
                      Successfully extracted {extractedTopics.length} topics from your uploaded file.
                    </div>
                  </div>
                )}

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <div className="font-semibold text-yellow-800">Pro Tips</div>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li>• Be specific with topic names</li>
                    <li>• Start with 15-20 cards</li>
                    <li>• Choose appropriate difficulty</li>
                    <li>• Review regularly for best results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default FlashcardSetup;