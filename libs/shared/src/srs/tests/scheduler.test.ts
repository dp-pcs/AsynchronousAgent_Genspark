import { StudyScheduler } from '../scheduler';
import { SRSCard, StudySession, ReviewResult } from '../types';

describe('StudyScheduler', () => {
  let scheduler: StudyScheduler;

  beforeEach(() => {
    scheduler = new StudyScheduler();
  });

  describe('Card Management', () => {
    it('should add a new card', () => {
      const card = scheduler.addCard('test-card-1');
      
      expect(card.id).toBe('test-card-1');
      expect(card.easeFactor).toBe(2.5);
      expect(card.interval).toBe(1);
      expect(card.repetition).toBe(0);
      expect(scheduler.getAllCards()).toHaveLength(1);
    });

    it('should get all cards', () => {
      scheduler.addCard('card1');
      scheduler.addCard('card2');
      
      const cards = scheduler.getAllCards();
      expect(cards).toHaveLength(2);
    });

    it('should get card by ID', () => {
      const card = scheduler.addCard('test-card');
      const retrieved = scheduler.getCard(card.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(card.id);
    });

    it('should return undefined for non-existent card', () => {
      const card = scheduler.getCard('non-existent');
      expect(card).toBeUndefined();
    });
  });

  describe('Study Session Management', () => {
    it('should get due cards', () => {
      // Add cards (they should be due immediately)
      scheduler.addCard('card1');
      scheduler.addCard('card2');
      
      const dueCards = scheduler.getDueCards();
      expect(dueCards).toHaveLength(2);
    });

    it('should start a study session', () => {
      const session = scheduler.startStudySession();
      
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.endTime).toBe(null);
      expect(session.cardsReviewed).toBe(0);
      expect(session.cardsCorrect).toBe(0);
      expect(session.results).toEqual([]);
    });

    it('should submit a review result', () => {
      const card = scheduler.addCard('test-card');
      const session = scheduler.startStudySession();
      
      const reviewResult: ReviewResult = {
        flashcardId: card.id,
        quality: 4,
        correct: true,
        responseTime: 5000,
        reviewedAt: new Date()
      };
      
      const result = scheduler.submitReview(session.id, reviewResult);
      
      expect(result.updatedCard).toBeDefined();
      expect(result.updatedCard.totalReviews).toBe(1);
      expect(result.session.cardsReviewed).toBe(1);
      expect(result.session.cardsCorrect).toBe(1);
    });

    it('should throw error when reviewing in non-existent session', () => {
      const card = scheduler.addCard('test-card');
      const reviewResult: ReviewResult = {
        flashcardId: card.id,
        quality: 4,
        correct: true,
        responseTime: 5000,
        reviewedAt: new Date()
      };
      
      expect(() => scheduler.submitReview('non-existent', reviewResult)).toThrow();
    });

    it('should end a study session', () => {
      const session = scheduler.startStudySession();
      
      // Add a small delay to ensure positive total time
      setTimeout(() => {}, 1);
      
      const endedSession = scheduler.endStudySession(session.id);
      
      expect(endedSession).toBeDefined();
      expect(endedSession.endTime).toBeInstanceOf(Date);
      expect(endedSession.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when ending non-existent session', () => {
      expect(() => scheduler.endStudySession('non-existent')).toThrow();
    });
  });

  describe('Statistics', () => {
    it('should calculate basic statistics', () => {
      // Add cards
      scheduler.addCard('card1');
      scheduler.addCard('card2');
      
      const stats = scheduler.getStats();
      
      expect(stats.totalCards).toBe(2);
      expect(stats.dueToday).toBe(2); // Both cards should be due initially
      expect(stats.accuracy).toBe(0); // No sessions completed yet
    });

    it('should handle empty statistics', () => {
      const stats = scheduler.getStats();
      
      expect(stats.totalCards).toBe(0);
      expect(stats.dueToday).toBe(0);
      expect(stats.accuracy).toBe(0);
      expect(stats.totalStudyTime).toBe(0);
    });

    it('should get upcoming reviews', () => {
      scheduler.addCard('card1');
      scheduler.addCard('card2');
      
      const upcoming = scheduler.getUpcomingReviews(7);
      
      expect(Object.keys(upcoming)).toHaveLength(7);
      // Today should have cards due
      const today = new Date().toISOString().split('T')[0];
      expect(upcoming[today]).toBeGreaterThan(0);
    });
  });

  describe('Persistence', () => {
    it('should export state', () => {
      scheduler.addCard('card1');
      scheduler.addCard('card2');
      
      const state = scheduler.exportState();
      
      expect(Object.keys(state.cards)).toHaveLength(2);
      expect(Object.keys(state.sessions)).toHaveLength(0);
    });

    it('should import state', () => {
      scheduler.addCard('card1');
      const originalState = scheduler.exportState();
      
      // Create new scheduler and import state
      const newScheduler = new StudyScheduler();
      newScheduler.importState(originalState);
      
      const importedCards = newScheduler.getAllCards();
      expect(importedCards).toHaveLength(1);
      expect(importedCards[0].id).toBe('card1');
    });

    it('should handle empty state import', () => {
      const emptyState = { cards: {}, sessions: {} };
      scheduler.importState(emptyState);
      
      expect(scheduler.getAllCards()).toHaveLength(0);
    });

    it('should reset scheduler', () => {
      scheduler.addCard('card1');
      scheduler.startStudySession();
      
      scheduler.reset();
      
      expect(scheduler.getAllCards()).toHaveLength(0);
    });
  });
});