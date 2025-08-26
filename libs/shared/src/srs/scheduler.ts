// Study Session Scheduler and Manager

import { SRSCard, ReviewResult, StudySession, QualityRating } from './types';
import { SM2Algorithm } from './algorithm';

export class StudyScheduler {
  private cards: Map<string, SRSCard> = new Map();
  private sessions: Map<string, StudySession> = new Map();
  
  /**
   * Add a card to the scheduler
   */
  addCard(id: string): SRSCard {
    const card = SM2Algorithm.createNewCard(id);
    this.cards.set(id, card);
    return card;
  }
  
  /**
   * Get a card by ID
   */
  getCard(id: string): SRSCard | undefined {
    return this.cards.get(id);
  }
  
  /**
   * Get all cards
   */
  getAllCards(): SRSCard[] {
    return Array.from(this.cards.values());
  }
  
  /**
   * Get cards due for review
   */
  getDueCards(): SRSCard[] {
    return SM2Algorithm.getDueCards(this.getAllCards());
  }
  
  /**
   * Get optimal study order for due cards
   */
  getStudyQueue(): SRSCard[] {
    return SM2Algorithm.getOptimalStudyOrder(this.getAllCards());
  }
  
  /**
   * Start a new study session
   */
  startStudySession(): StudySession {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      endTime: null,
      cardsReviewed: 0,
      cardsCorrect: 0,
      totalTime: 0,
      results: []
    };
    
    this.sessions.set(session.id, session);
    return session;
  }
  
  /**
   * Submit a review result and update the card
   */
  submitReview(sessionId: string, result: ReviewResult): {
    updatedCard: SRSCard;
    session: StudySession;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Study session ${sessionId} not found`);
    }
    
    const card = this.cards.get(result.flashcardId);
    if (!card) {
      throw new Error(`Card ${result.flashcardId} not found`);
    }
    
    // Update card with SM-2 algorithm
    const updates = SM2Algorithm.calculateNext(card, result.quality as QualityRating);
    const updatedCard = { ...card, ...updates };
    this.cards.set(card.id, updatedCard);
    
    // Update session
    session.results.push(result);
    session.cardsReviewed++;
    if (result.correct) {
      session.cardsCorrect++;
    }
    
    return { updatedCard, session };
  }
  
  /**
   * End a study session
   */
  endStudySession(sessionId: string): StudySession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Study session ${sessionId} not found`);
    }
    
    session.endTime = new Date();
    session.totalTime = session.endTime.getTime() - session.startTime.getTime();
    
    return session;
  }
  
  /**
   * Get study statistics
   */
  getStats() {
    const cards = this.getAllCards();
    const basicStats = SM2Algorithm.calculateStats(cards);
    
    // Calculate additional stats from sessions
    const sessions = Array.from(this.sessions.values()).filter(s => s.endTime);
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.totalTime, 0);
    const totalReviews = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.cardsCorrect, 0);
    
    return {
      ...basicStats,
      totalStudyTime,
      totalReviews,
      accuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
      sessionsCompleted: sessions.length,
      averageSessionLength: sessions.length > 0 ? totalStudyTime / sessions.length : 0
    };
  }
  
  /**
   * Get upcoming reviews for the next N days
   */
  getUpcomingReviews(days: number = 7): Record<string, number> {
    const upcoming: Record<string, number> = {};
    const now = new Date();
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      upcoming[dateKey] = 0;
    }
    
    // Count cards due each day
    this.getAllCards().forEach(card => {
      const reviewDate = card.nextReview.toISOString().split('T')[0];
      if (upcoming.hasOwnProperty(reviewDate)) {
        upcoming[reviewDate]++;
      }
    });
    
    return upcoming;
  }
  
  /**
   * Export scheduler state for persistence
   */
  exportState(): {
    cards: Record<string, SRSCard>;
    sessions: Record<string, StudySession>;
  } {
    return {
      cards: Object.fromEntries(this.cards),
      sessions: Object.fromEntries(this.sessions)
    };
  }
  
  /**
   * Import scheduler state from persistence
   */
  importState(state: {
    cards: Record<string, SRSCard>;
    sessions: Record<string, StudySession>;
  }): void {
    // Convert date strings back to Date objects
    Object.entries(state.cards).forEach(([id, card]) => {
      this.cards.set(id, {
        ...card,
        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : null,
        nextReview: new Date(card.nextReview)
      });
    });
    
    Object.entries(state.sessions).forEach(([id, session]) => {
      this.sessions.set(id, {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : null,
        results: session.results.map(result => ({
          ...result,
          reviewedAt: new Date(result.reviewedAt)
        }))
      });
    });
  }
  
  /**
   * Reset all cards (for testing/demo purposes)
   */
  reset(): void {
    this.cards.clear();
    this.sessions.clear();
  }
}