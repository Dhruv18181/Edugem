import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, UserProgress } from '../types';
import { geminiService } from '../utils/gemini';
import { storageService } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';
import { ArrowLeft, RotateCcw, TrendingUp, CheckCircle } from 'lucide-react';

const Learning: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);

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
    if (subjectId) {
      loadProgress();
      generateQuestions();
    }
  }, [subjectId]);

  const loadProgress = () => {
    const allProgress = storageService.getUserProgress();
    const currentProgress = allProgress[subjectId!];
    
    if (currentProgress) {
      setProgress(currentProgress);
    } else {
      const newProgress: UserProgress = {
        subjectId: subjectId!,
        currentDifficulty: 'beginner',
        completedQuestions: 0,
        correctAnswers: 0,
        sessionScores: [],
        lastAccessed: new Date().toISOString()
      };
      setProgress(newProgress);
      storageService.saveUserProgress(subjectId!, newProgress);
    }
  };

  const generateQuestions = async () => {
    if (!subjectId) return;
    
    setLoading(true);
    try {
      const currentProgress = storageService.getUserProgress()[subjectId];
      const difficulty = currentProgress?.currentDifficulty || 'beginner';
      const subjectName = subjectNames[subjectId];
      
      const newQuestions = await geminiService.generateQuestions(subjectName, difficulty, 5);
      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setIsAnswered(false);
      setFeedback(null);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!questions[currentQuestion]) return;
    
    setLoading(true);
    try {
      const evaluation = await geminiService.evaluateAnswer(questions[currentQuestion], answer);
      setFeedback(evaluation);
      setIsAnswered(true);
      
      const newScores = [...sessionScores, evaluation.score];
      setSessionScores(newScores);
      
      // Update progress
      if (progress) {
        const updatedProgress: UserProgress = {
          ...progress,
          completedQuestions: progress.completedQuestions + 1,
          correctAnswers: progress.correctAnswers + (evaluation.isCorrect ? 1 : 0),
          sessionScores: [...progress.sessionScores, evaluation.score],
          lastAccessed: new Date().toISOString()
        };
        
        // Adjust difficulty based on performance
        const recentScores = updatedProgress.sessionScores.slice(-5);
        const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        
        if (averageScore >= 80 && updatedProgress.currentDifficulty === 'beginner') {
          updatedProgress.currentDifficulty = 'intermediate';
        } else if (averageScore >= 85 && updatedProgress.currentDifficulty === 'intermediate') {
          updatedProgress.currentDifficulty = 'advanced';
        } else if (averageScore < 60 && updatedProgress.currentDifficulty === 'advanced') {
          updatedProgress.currentDifficulty = 'intermediate';
        } else if (averageScore < 50 && updatedProgress.currentDifficulty === 'intermediate') {
          updatedProgress.currentDifficulty = 'beginner';
        }
        
        setProgress(updatedProgress);
        storageService.saveUserProgress(subjectId!, updatedProgress);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(false);
      setFeedback(null);
    } else {
      // Session complete, show assessment
      navigate('/progress', { state: { completedSession: true, subjectId } });
    }
  };

  const restartSession = () => {
    generateQuestions();
    setSessionScores([]);
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">
              {subjectNames[subjectId!]} Learning
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={restartSession}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restart</span>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Progress</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600 capitalize">
              Difficulty: {progress?.currentDifficulty}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {questions[currentQuestion] && (
          <div className="mb-8">
            <QuestionCard
              question={questions[currentQuestion]}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              feedback={feedback}
            />
          </div>
        )}

        {/* Actions */}
        {isAnswered && (
          <div className="flex justify-center">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>Next Question</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/progress', { state: { completedSession: true, subjectId } })}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Session</span>
              </button>
            )}
          </div>
        )}

        {/* Session Stats */}
        {sessionScores.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{sessionScores.length}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)}%
                </p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {sessionScores.filter(s => s >= 70).length}
                </p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;