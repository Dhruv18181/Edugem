export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
}

export interface Question {
  id: string;
  subject: string;
  type: 'multiple-choice' | 'coding' | 'short-answer' | 'essay';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface UserProgress {
  subjectId: string;
  currentDifficulty: 'beginner' | 'intermediate' | 'advanced';
  completedQuestions: number;
  correctAnswers: number;
  sessionScores: number[];
  lastAccessed: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  topic: string;
  tags: string[];
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  flashcards: Flashcard[];
  createdAt: Date;
  lastStudied?: Date;
  totalCards: number;
  masteredCards: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCustom: boolean;
  sourceFile?: string;
}

export interface StudySession {
  id: string;
  flashcardSetId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  averageResponseTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CustomUpload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  processedContent?: string;
  extractedTopics: string[];
  status: 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  difficulty: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}