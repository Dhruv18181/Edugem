import { FlashcardSet, Flashcard, StudySession, CustomUpload } from '../types';

const STORAGE_KEYS = {
  FLASHCARD_SETS: 'eduplatform_flashcard_sets',
  STUDY_SESSIONS: 'eduplatform_study_sessions',
  CUSTOM_UPLOADS: 'eduplatform_custom_uploads'
};

export class FlashcardStorageService {
  // Flashcard Sets Management
  getFlashcardSets(): FlashcardSet[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARD_SETS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveFlashcardSet(flashcardSet: FlashcardSet): void {
    try {
      const sets = this.getFlashcardSets();
      const existingIndex = sets.findIndex(set => set.id === flashcardSet.id);
      
      if (existingIndex >= 0) {
        sets[existingIndex] = flashcardSet;
      } else {
        sets.push(flashcardSet);
      }
      
      localStorage.setItem(STORAGE_KEYS.FLASHCARD_SETS, JSON.stringify(sets));
    } catch (error) {
      console.error('Error saving flashcard set:', error);
    }
  }

  getFlashcardSet(id: string): FlashcardSet | null {
    const sets = this.getFlashcardSets();
    return sets.find(set => set.id === id) || null;
  }

  deleteFlashcardSet(id: string): void {
    try {
      const sets = this.getFlashcardSets();
      const filteredSets = sets.filter(set => set.id !== id);
      localStorage.setItem(STORAGE_KEYS.FLASHCARD_SETS, JSON.stringify(filteredSets));
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
    }
  }

  getFlashcardSetsBySubject(subject: string): FlashcardSet[] {
    return this.getFlashcardSets().filter(set => set.subject === subject);
  }

  // Individual Flashcard Management
  updateFlashcard(setId: string, flashcard: Flashcard): void {
    try {
      const sets = this.getFlashcardSets();
      const setIndex = sets.findIndex(set => set.id === setId);
      
      if (setIndex >= 0) {
        const cardIndex = sets[setIndex].flashcards.findIndex(card => card.id === flashcard.id);
        if (cardIndex >= 0) {
          sets[setIndex].flashcards[cardIndex] = flashcard;
          localStorage.setItem(STORAGE_KEYS.FLASHCARD_SETS, JSON.stringify(sets));
        }
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  }

  // Study Sessions Management
  getStudySessions(): StudySession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveStudySession(session: StudySession): void {
    try {
      const sessions = this.getStudySessions();
      sessions.push(session);
      // Keep only last 50 sessions
      const limitedSessions = sessions.slice(-50);
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  }

  getStudySessionsBySet(flashcardSetId: string): StudySession[] {
    return this.getStudySessions().filter(session => session.flashcardSetId === flashcardSetId);
  }

  // Custom Uploads Management
  getCustomUploads(): CustomUpload[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_UPLOADS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveCustomUpload(upload: CustomUpload): void {
    try {
      const uploads = this.getCustomUploads();
      const existingIndex = uploads.findIndex(u => u.id === upload.id);
      
      if (existingIndex >= 0) {
        uploads[existingIndex] = upload;
      } else {
        uploads.push(upload);
      }
      
      localStorage.setItem(STORAGE_KEYS.CUSTOM_UPLOADS, JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving custom upload:', error);
    }
  }

  deleteCustomUpload(id: string): void {
    try {
      const uploads = this.getCustomUploads();
      const filteredUploads = uploads.filter(upload => upload.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_UPLOADS, JSON.stringify(filteredUploads));
    } catch (error) {
      console.error('Error deleting custom upload:', error);
    }
  }

  // Statistics and Analytics
  getFlashcardStats(setId: string): {
    totalCards: number;
    masteredCards: number;
    averageConfidence: number;
    lastStudied?: Date;
  } {
    const set = this.getFlashcardSet(setId);
    if (!set) {
      return { totalCards: 0, masteredCards: 0, averageConfidence: 0 };
    }

    const totalCards = set.flashcards.length;
    const masteredCards = set.flashcards.filter(card => card.confidence === 'high').length;
    const confidenceValues = set.flashcards.map(card => {
      switch (card.confidence) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 1;
      }
    });
    
    const averageConfidence = confidenceValues.length > 0 
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length 
      : 0;

    return {
      totalCards,
      masteredCards,
      averageConfidence,
      lastStudied: set.lastStudied ? new Date(set.lastStudied) : undefined
    };
  }

  getOverallStats(): {
    totalSets: number;
    totalCards: number;
    totalStudySessions: number;
    averageSessionScore: number;
  } {
    const sets = this.getFlashcardSets();
    const sessions = this.getStudySessions();
    
    const totalSets = sets.length;
    const totalCards = sets.reduce((sum, set) => sum + set.flashcards.length, 0);
    const totalStudySessions = sessions.length;
    
    const averageSessionScore = sessions.length > 0
      ? sessions.reduce((sum, session) => {
          const score = session.cardsStudied > 0 ? (session.correctAnswers / session.cardsStudied) * 100 : 0;
          return sum + score;
        }, 0) / sessions.length
      : 0;

    return {
      totalSets,
      totalCards,
      totalStudySessions,
      averageSessionScore
    };
  }
}

export const flashcardStorage = new FlashcardStorageService();