import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserProgress, AssessmentResult } from '../types';
import { storageService } from '../utils/storage';
import { geminiService } from '../utils/gemini';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  Calendar,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

const Progress: React.FC = () => {
  const location = useLocation();
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const progress = storageService.getUserProgress();
    setUserProgress(progress);

    // Check if we just completed a session
    if (location.state?.completedSession && location.state?.subjectId) {
      generateAssessment(location.state.subjectId);
    }
  }, [location.state]);

  const generateAssessment = async (subjectId: string) => {
    const progress = userProgress[subjectId];
    if (!progress || progress.sessionScores.length === 0) return;

    setLoading(true);
    try {
      const recentScores = progress.sessionScores.slice(-10); // Last 10 questions
      const subjectName = subjectNames[subjectId];
      
      const assessmentResult = await geminiService.generateAssessment(
        subjectName,
        recentScores,
        progress.currentDifficulty
      );
      
      setAssessment(assessmentResult);
      storageService.saveAssessment({ ...assessmentResult, subjectId, subjectName });
    } catch (error) {
      console.error('Error generating assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    const allProgress = Object.values(userProgress);
    const totalQuestions = allProgress.reduce((sum, p) => sum + p.completedQuestions, 0);
    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const allScores = allProgress.flatMap(p => p.sessionScores);
    const averageScore = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    
    return {
      totalQuestions,
      totalCorrect,
      averageScore: Math.round(averageScore),
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      activeSubjects: allProgress.length
    };
  };

  const stats = getOverallStats();

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
          <p className="text-gray-600">Track your performance and get personalized insights</p>
        </div>

        {/* Assessment Results */}
        {assessment && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Session Complete!</h2>
                  <p className="text-blue-100">Here's your personalized assessment</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(assessment.score)}%</div>
                  <div className="text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{assessment.totalQuestions}</div>
                  <div className="text-gray-600">Questions Completed</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 capitalize ${getDifficultyColor(assessment.difficulty).split(' ')[0]}`}>
                    {assessment.difficulty}
                  </div>
                  <div className="text-gray-600">Difficulty Level</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {assessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {assessment.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                  Personalized Recommendations
                </h3>
                <ul className="space-y-2">
                  {assessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubjects}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCorrect}</p>
              </div>
              <Award className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              Subject Progress
            </h2>
          </div>
          
          <div className="p-6">
            {Object.keys(userProgress).length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No progress data yet</p>
                <p className="text-gray-400 text-sm">Start learning to see your progress here!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(userProgress).map(([subjectId, progress]) => {
                  const averageScore = progress.sessionScores.length 
                    ? progress.sessionScores.reduce((a, b) => a + b, 0) / progress.sessionScores.length 
                    : 0;
                  
                  return (
                    <div key={subjectId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subjectNames[subjectId]}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(progress.currentDifficulty)}`}>
                          {progress.currentDifficulty}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{progress.completedQuestions}</div>
                          <div className="text-sm text-gray-600">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{progress.correctAnswers}</div>
                          <div className="text-sm text-gray-600">Correct</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getProgressColor(averageScore).split(' ')[0]}`}>
                            {Math.round(averageScore)}%
                          </div>
                          <div className="text-sm text-gray-600">Average</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {progress.completedQuestions > 0 ? Math.round((progress.correctAnswers / progress.completedQuestions) * 100) : 0}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;