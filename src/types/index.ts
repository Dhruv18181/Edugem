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

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  difficulty: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}