import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardStorage } from '../utils/flashcardStorage';
import { FlashcardSet, Flashcard, StudySession } from '../types';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy,
  Clock,
  Target,
  Shuffle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Star,
  BookOpen
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
  const [isFlipped, setIsFlipped] = useState(false);

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
        break;
    }
    
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionStats({
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
      totalResponseTime: 0
    });
    setCardStartTime(new Date());
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleNextCard = () => {
    if (!flashcardSet || !studyCards[currentCardIndex]) return;

    const responseTime = Date.now() - cardStartTime.getTime();
    const currentCard = studyCards[currentCardIndex];
    
    // Update card statistics (assume correct for automatic progression)
    const updatedCard: Flashcard = {
      ...currentCard,
      lastReviewed: new Date(),
      reviewCount: currentCard.reviewCount + 1,
      correctCount: currentCard.correctCount + 1,
      confidence: calculateConfidence(currentCard, true)
    };

    // Update session statistics
    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: prev.correctAnswers + 1,
      totalResponseTime: prev.totalResponseTime + responseTime
    }));

    // Update flashcard in storage
    flashcardStorage.updateFlashcard(flashcardSet.id, updatedCard);

    // Move to next card or complete session
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setIsFlipped(false);
      setCardStartTime(new Date());
    } else {
      completeSession();
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setIsFlipped(false);
      setCardStartTime(new Date());
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
    setIsFlipped(false);
    setCardStartTime(new Date());
  };

  // Clean text function to remove asterisks and format properly
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks
      .replace(/\*(.*?)\*/g, '$1') // Remove italic asterisks
      .replace(/\*+/g, '') // Remove any remaining asterisks
      .trim();
  };

  if (!flashcardSet || studyCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Congratulations!</h1>
            <p className="text-white/80 text-xl mb-12">You've completed studying {flashcardSet.title}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-2">{sessionStats.cardsStudied}</div>
                <div className="text-white/70">Cards Studied</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-white/70">Completion</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.round(sessionStats.totalResponseTime / sessionStats.cardsStudied / 1000)}s
                </div>
                <div className="text-white/70">Avg. Time</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={restartSession}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Study Again</span>
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Progress</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <div className="h-6 w-px bg-white/30" />
              <h1 className="text-2xl font-bold text-white">{cleanText(flashcardSet.title)}</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={shuffleCards}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Shuffle Cards"
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                onClick={restartSession}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Restart Session"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80 text-lg font-medium">
                Card {currentCardIndex + 1} of {studyCards.length}
              </span>
              <span className="text-white/80 text-lg font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Flashcard Area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="max-w-4xl w-full">
            {/* Flashcard */}
            <div className="relative">
              <div 
                className={`relative w-full h-96 cursor-pointer transition-all duration-700 transform-gpu ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={handleCardFlip}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl h-full flex flex-col justify-center items-center text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white/80 text-sm font-medium backdrop-blur-sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Question
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-6 leading-relaxed">
                      {cleanText(currentCard.front)}
                    </h2>
                    <div className="flex items-center space-x-2 text-white/60">
                      <Eye className="h-5 w-5" />
                      <span>Click to reveal answer</span>
                    </div>
                  </div>
                </div>

                {/* Back of card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-3xl p-12 border border-emerald-300/30 shadow-2xl h-full flex flex-col justify-center items-center text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-500/30 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                        <Star className="h-4 w-4 mr-2" />
                        Answer
                      </div>
                    </div>
                    <p className="text-2xl text-white mb-6 leading-relaxed">
                      {cleanText(currentCard.back)}
                    </p>
                    <div className="flex items-center space-x-2 text-white/60">
                      <EyeOff className="h-5 w-5" />
                      <span>Click to flip back</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card metadata */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentCard.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    currentCard.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                  <span className="text-white/60 text-sm">
                    Topic: {cleanText(currentCard.topic)}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentCard.confidence === 'high' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  currentCard.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {currentCard.confidence} confidence
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-12">
              <button
                onClick={handlePreviousCard}
                disabled={currentCardIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <div className="text-white/60 text-sm mb-2">Progress</div>
                <div className="text-2xl font-bold text-white">
                  {currentCardIndex + 1} / {studyCards.length}
                </div>
              </div>

              <button
                onClick={handleNextCard}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
              >
                <span>{currentCardIndex === studyCards.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{sessionStats.cardsStudied}</div>
                    <div className="text-white/60 text-sm">Cards Studied</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                    <div className="text-white/60 text-sm">Progress</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{studyCards.length - currentCardIndex - 1}</div>
                    <div className="text-white/60 text-sm">Cards Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default FlashcardStudy;