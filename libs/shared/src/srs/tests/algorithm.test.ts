import { SM2Algorithm } from '../algorithm';
import { SRSCard, ReviewResult } from '../types';

describe('SM2Algorithm', () => {
  describe('createNewCard', () => {
    it('should create a new card with default values', () => {
      const card = SM2Algorithm.createNewCard('test-id');
      
      expect(card.id).toBe('test-id');
      expect(card.easeFactor).toBe(2.5);
      expect(card.interval).toBe(1);
      expect(card.repetition).toBe(0);
      expect(card.totalReviews).toBe(0);
      expect(card.nextReview).toBeInstanceOf(Date);
    });
  });

  describe('calculateNext', () => {
    let card: SRSCard;

    beforeEach(() => {
      card = SM2Algorithm.createNewCard('test-id');
    });

    it('should handle quality 0 (complete blackout)', () => {
      const result = SM2Algorithm.calculateNext(card, 0);
      
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should handle quality 1 (incorrect but remembered)', () => {
      const result = SM2Algorithm.calculateNext(card, 1);
      
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should handle quality 2 (incorrect but familiar)', () => {
      const result = SM2Algorithm.calculateNext(card, 2);
      
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should handle quality 3 (correct with effort)', () => {
      const result = SM2Algorithm.calculateNext(card, 3);
      
      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5); // Should decrease slightly
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should handle quality 4 (correct with some thought)', () => {
      const result = SM2Algorithm.calculateNext(card, 4);
      
      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5); // Should remain the same
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should handle quality 5 (perfect recall)', () => {
      const result = SM2Algorithm.calculateNext(card, 5);
      
      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.totalReviews).toBe(card.totalReviews + 1);
    });

    it('should progress intervals correctly over multiple reviews', () => {
      let currentCard = card;
      
      // First review with quality 4
      const result1 = SM2Algorithm.calculateNext(currentCard, 4);
      currentCard = { ...currentCard, ...result1 };
      expect(currentCard.repetition).toBe(1);
      expect(currentCard.interval).toBe(1);
      
      // Second review with quality 4
      const result2 = SM2Algorithm.calculateNext(currentCard, 4);
      currentCard = { ...currentCard, ...result2 };
      expect(currentCard.repetition).toBe(2);
      expect(currentCard.interval).toBe(6);
      
      // Third review with quality 4
      const result3 = SM2Algorithm.calculateNext(currentCard, 4);
      currentCard = { ...currentCard, ...result3 };
      expect(currentCard.repetition).toBe(3);
      expect(currentCard.interval).toBeGreaterThan(6);
    });

    it('should reset on poor performance after good streak', () => {
      let currentCard = card;
      
      // Build up a streak
      const result1 = SM2Algorithm.calculateNext(currentCard, 4);
      currentCard = { ...currentCard, ...result1 };
      const result2 = SM2Algorithm.calculateNext(currentCard, 4);
      currentCard = { ...currentCard, ...result2 };
      expect(currentCard.repetition).toBe(2);
      expect(currentCard.interval).toBe(6);
      
      // Fail the review
      const result3 = SM2Algorithm.calculateNext(currentCard, 1);
      currentCard = { ...currentCard, ...result3 };
      expect(currentCard.repetition).toBe(0);
      expect(currentCard.interval).toBe(1);
    });

    it('should enforce minimum ease factor', () => {
      let currentCard = card;
      
      // Repeatedly fail to drive ease factor down
      for (let i = 0; i < 10; i++) {
        const result = SM2Algorithm.calculateNext(currentCard, 0);
        currentCard = { ...currentCard, ...result };
      }
      
      expect(currentCard.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('isDue', () => {
    it('should return true for cards due now or in the past', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const card = SM2Algorithm.createNewCard('test-id');
      card.nextReview = pastDate;
      
      expect(SM2Algorithm.isDue(card)).toBe(true);
    });

    it('should return false for cards due in the future', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const card = SM2Algorithm.createNewCard('test-id');
      card.nextReview = futureDate;
      
      expect(SM2Algorithm.isDue(card)).toBe(false);
    });
  });

  describe('getOptimalStudyOrder', () => {
    it('should sort cards by urgency (overdue first)', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const card1 = SM2Algorithm.createNewCard('1');
      card1.nextReview = tomorrow; // Not due
      
      const card2 = SM2Algorithm.createNewCard('2');
      card2.nextReview = yesterday; // Overdue
      
      const card3 = SM2Algorithm.createNewCard('3');
      card3.nextReview = now; // Due now
      
      const sorted = SM2Algorithm.getOptimalStudyOrder([card1, card2, card3]);
      
      expect(sorted[0].id).toBe('2'); // Most overdue first
      expect(sorted[1].id).toBe('3'); // Due now second
      expect(sorted.length).toBe(2); // Only due cards
    });

    it('should handle empty array', () => {
      const sorted = SM2Algorithm.getOptimalStudyOrder([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('Legacy compatibility', () => {
    it('should maintain backward compatibility with scheduleNextReview', () => {
      // Test the legacy function still works
      const { scheduleNextReview } = require('../algorithm');
      
      const result = scheduleNextReview(1, 0.8); // daysSinceLast=1, quality=0.8 (converted to 4)
      
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });
  });

  describe('calculateStats', () => {
    it('should calculate statistics for cards collection', () => {
      const card1 = SM2Algorithm.createNewCard('1');
      const card2 = SM2Algorithm.createNewCard('2');
      
      const stats = SM2Algorithm.calculateStats([card1, card2]);
      
      expect(stats.totalCards).toBe(2);
      expect(stats.dueToday).toBe(2); // Both new cards are due
      expect(stats.averageEaseFactor).toBe(2.5);
      expect(stats.intervalDistribution['1 day']).toBe(2);
    });
    
    it('should handle empty card collection', () => {
      const stats = SM2Algorithm.calculateStats([]);
      
      expect(stats.totalCards).toBe(0);
      expect(stats.dueToday).toBe(0);
      expect(stats.averageEaseFactor).toBe(2.5);
    });
  });
});