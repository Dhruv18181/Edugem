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
  File
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">
              Create Flashcards - {subjectName}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Upload Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Upload className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Upload Custom Materials</h2>
                </div>
                <button
                  onClick={() => setShowCustomUpload(!showCustomUpload)}
                  className="text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {showCustomUpload ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCustomUpload && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Upload your study materials (images, PDFs, or text files) and we'll extract topics and generate flashcards automatically.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, PDF, or TXT files up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadFile && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {React.createElement(getFileIcon(uploadFile), { className: "h-6 w-6 text-blue-600" })}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{uploadFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {uploadProgress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Processing...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={processUploadedFile}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>Process File</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Topics Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Learning Topics</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                {extractedContent 
                  ? 'Topics extracted from your uploaded file. You can add or remove topics as needed.'
                  : 'Specify the exact topics you want to learn. Be specific for better flashcard generation.'
                }
              </p>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                  placeholder="e.g., React Hooks, State Management, Component Lifecycle"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTopic}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {topic}
                      <button
                        onClick={() => removeTopic(topic)}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Flashcard Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Cards
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateFlashcards}
              disabled={loading || topics.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  <span>Generate Flashcards</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Subject</div>
                  <div className="font-medium text-gray-900">{subjectName}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Topics ({topics.length})</div>
                  <div className="text-sm text-gray-900">
                    {topics.length > 0 ? topics.join(', ') : 'No topics added yet'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Settings</div>
                  <div className="text-sm text-gray-900">
                    <div>Difficulty: <span className="capitalize">{difficulty}</span></div>
                    <div>Cards: {cardCount}</div>
                    {extractedContent && <div>Source: Custom Upload</div>}
                  </div>
                </div>

                {extractedTopics.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="text-sm font-medium text-green-800">File Processed</div>
                    </div>
                    <div className="text-sm text-green-700">
                      Extracted {extractedTopics.length} topics from your uploaded file
                    </div>
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

export default FlashcardSetup;