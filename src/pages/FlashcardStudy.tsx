import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardStorage } from '../utils/flashcardStorage';
import { FlashcardSet, Flashcard, StudySession } from '../types';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Trophy,
  Clock,
  Target,
  Shuffle,
  Settings,
  BarChart3
} from 'lucide-react';

const FlashcardStudy: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    cardsStudied: 0,
    correctAnswers: 0,
    totalResponseTime: 0
  });
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [isComplete, setIsComplete] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'difficult' | 'random'>('all');

  useEffect(() => {
    if (setId) {
      const set = flashcardStorage.getFlashcardSet(setId);
      if (set) {
        setFlashcardSet(set);
        initializeStudySession(set);
      } else {
        navigate('/dashboard');
      }
    }
  }, [setId, navigate]);

  const initializeStudySession = (set: FlashcardSet) => {
    let cards = [...set.flashcards];
    
    switch (studyMode) {
      case 'difficult':
        cards = cards.filter(card => card.confidence === 'low' || card.confidence === 'medium');
        break;
      case 'random':
        cards = cards.sort(() => Math.random() - 0.5);
        break;
      default:
        // Keep original order for 'all'
        break;
    }
    
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsComplete(false);
    setSessionStats({
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
      totalResponseTime: 0
    });
    setCardStartTime(new Date());
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!flashcardSet || !studyCards[currentCardIndex]) return;

    const responseTime = Date.now() - cardStartTime.getTime();
    const currentCard = studyCards[currentCardIndex];
    
    // Update card statistics
    const updatedCard: Flashcard = {
      ...currentCard,
      lastReviewed: new Date(),
      reviewCount: currentCard.reviewCount + 1,
      correctCount: currentCard.correctCount + (isCorrect ? 1 : 0),
      confidence: calculateConfidence(currentCard, isCorrect)
    };

    // Update session statistics
    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalResponseTime: prev.totalResponseTime + responseTime
    }));

    // Update flashcard in storage
    flashcardStorage.updateFlashcard(flashcardSet.id, updatedCard);

    // Move to next card or complete session
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setCardStartTime(new Date());
    } else {
      completeSession();
    }
  };

  const calculateConfidence = (card: Flashcard, isCorrect: boolean): 'low' | 'medium' | 'high' => {
    const accuracy = card.reviewCount > 0 ? (card.correctCount + (isCorrect ? 1 : 0)) / (card.reviewCount + 1) : (isCorrect ? 1 : 0);
    
    if (accuracy >= 0.8 && card.reviewCount >= 2) return 'high';
    if (accuracy >= 0.6) return 'medium';
    return 'low';
  };

  const completeSession = () => {
    if (!flashcardSet) return;

    const session: StudySession = {
      id: `session-${Date.now()}`,
      flashcardSetId: flashcardSet.id,
      startTime: sessionStats.startTime,
      endTime: new Date(),
      cardsStudied: sessionStats.cardsStudied,
      correctAnswers: sessionStats.correctAnswers,
      averageResponseTime: sessionStats.totalResponseTime / sessionStats.cardsStudied,
      difficulty: flashcardSet.difficulty
    };

    flashcardStorage.saveStudySession(session);

    // Update flashcard set last studied time
    const updatedSet: FlashcardSet = {
      ...flashcardSet,
      lastStudied: new Date(),
      masteredCards: flashcardSet.flashcards.filter(card => card.confidence === 'high').length
    };
    flashcardStorage.saveFlashcardSet(updatedSet);

    setIsComplete(true);
  };

  const restartSession = () => {
    if (flashcardSet) {
      initializeStudySession(flashcardSet);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCardStartTime(new Date());
  };

  if (!flashcardSet || studyCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;
  const accuracy = sessionStats.cardsStudied > 0 ? (sessionStats.correctAnswers / sessionStats.cardsStudied) * 100 : 0;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Session Complete!</h1>
            <p className="text-gray-600 text-lg mb-8">Great job studying {flashcardSet.title}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{sessionStats.cardsStudied}</div>
                <div className="text-gray-600">Cards Studied</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(accuracy)}%</div>
                <div className="text-gray-600">Accuracy</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(sessionStats.totalResponseTime / sessionStats.cardsStudied / 1000)}s
                </div>
                <div className="text-gray-600">Avg. Response Time</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={restartSession}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Study Again</span>
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Progress</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">{flashcardSet.title}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={shuffleCards}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={restartSession}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Restart Session"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {studyCards.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(accuracy)}% accuracy
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[400px] flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{currentCard.topic}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentCard.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    currentCard.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentCard.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    currentCard.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentCard.confidence} confidence
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                  {currentCard.front}
                </div>
                
                {showAnswer && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-lg text-gray-800 leading-relaxed">
                      {currentCard.back}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Show Answer</span>
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Incorrect</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Correct</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{sessionStats.cardsStudied}</div>
                <div className="text-sm text-gray-600">Cards Studied</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(accuracy)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{sessionStats.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudy;