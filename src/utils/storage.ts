import { UserProgress, ChatMessage } from '../types';

const STORAGE_KEYS = {
  USER_PROGRESS: 'eduplatform_progress',
  CHAT_HISTORY: 'eduplatform_chat',
  ASSESSMENT_HISTORY: 'eduplatform_assessments'
};

export class StorageService {
  getUserProgress(): Record<string, UserProgress> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveUserProgress(subjectId: string, progress: UserProgress): void {
    try {
      const allProgress = this.getUserProgress();
      allProgress[subjectId] = progress;
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  getChatHistory(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveChatMessage(message: ChatMessage): void {
    try {
      const history = this.getChatHistory();
      history.push(message);
      // Keep only last 50 messages
      const limitedHistory = history.slice(-50);
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  clearChatHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  }

  getAssessmentHistory(): any[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveAssessment(assessment: any): void {
    try {
      const history = this.getAssessmentHistory();
      history.push({ ...assessment, timestamp: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  }
}

export const storageService = new StorageService();