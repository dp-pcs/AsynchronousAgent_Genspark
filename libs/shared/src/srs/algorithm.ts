// Enhanced SM-2 Algorithm Implementation

import { SRSCard, ReviewResult, QualityRating } from './types';

/**
 * SM-2 Algorithm Implementation
 * Based on the SuperMemo SM-2 algorithm with enhancements
 */
export class SM2Algorithm {
  
  /**
   * Calculate the next review parameters for a card based on review result
   */
  static calculateNext(card: SRSCard, quality: QualityRating): Partial<SRSCard> {
    const now = new Date();
    
    // Clone current card state
    let newEaseFactor = card.easeFactor;
    let newInterval = card.interval;
    let newRepetition = card.repetition;
    
    // SM-2 Algorithm Logic
    if (quality >= 3) {
      // Correct response (quality 3-5)
      
      if (newRepetition === 0) {
        newInterval = 1;
      } else if (newRepetition === 1) {
        newInterval = 6;
      } else {
        // Standard SM-2 formula: I(n) = I(n-1) * EF
        newInterval = Math.round(card.interval * newEaseFactor);
      }
      
      newRepetition += 1;
      
      // Adjust ease factor based on quality
      newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      
    } else {
      // Incorrect response (quality 0-2)
      newRepetition = 0;
      newInterval = 1; // Review again tomorrow
      
      // Reduce ease factor for difficult cards
      newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
    }
    
    // Ensure ease factor stays within bounds
    newEaseFactor = Math.max(1.3, Math.min(5.0, newEaseFactor));
    
    // Ensure minimum interval of 1 day
    newInterval = Math.max(1, newInterval);
    
    // Calculate next review date
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + newInterval);
    
    return {
      easeFactor: Number(newEaseFactor.toFixed(2)),
      interval: newInterval,
      repetition: newRepetition,
      lastReviewed: now,
      nextReview,
      totalReviews: card.totalReviews + 1
    };
  }
  
  /**
   * Create a new card with default SRS parameters
   */
  static createNewCard(id: string): SRSCard {
    const now = new Date();
    
    return {
      id,
      easeFactor: 2.5,
      interval: 1,
      repetition: 0,
      lastReviewed: null,
      nextReview: now, // Available for immediate study
      totalReviews: 0
    };
  }
  
  /**
   * Check if a card is due for review
   */
  static isDue(card: SRSCard): boolean {
    const now = new Date();
    return card.nextReview <= now;
  }
  
  /**
   * Get cards that are due for review
   */
  static getDueCards(cards: SRSCard[]): SRSCard[] {
    return cards.filter(card => SM2Algorithm.isDue(card));
  }
  
  /**
   * Calculate optimal study order (prioritize overdue cards)
   */
  static getOptimalStudyOrder(cards: SRSCard[]): SRSCard[] {
    const now = new Date();
    
    return cards
      .filter(card => SM2Algorithm.isDue(card))
      .sort((a, b) => {
        // Sort by how overdue they are (most overdue first)
        const aOverdue = now.getTime() - a.nextReview.getTime();
        const bOverdue = now.getTime() - b.nextReview.getTime();
        
        if (aOverdue !== bOverdue) {
          return bOverdue - aOverdue; // Most overdue first
        }
        
        // If equally overdue, prioritize cards with lower ease factor (more difficult)
        return a.easeFactor - b.easeFactor;
      });
  }
  
  /**
   * Calculate statistics for a collection of cards
   */
  static calculateStats(cards: SRSCard[]): {
    totalCards: number;
    dueToday: number;
    averageEaseFactor: number;
    intervalDistribution: Record<string, number>;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const dueToday = cards.filter(card => {
      const cardDue = new Date(card.nextReview.getFullYear(), card.nextReview.getMonth(), card.nextReview.getDate());
      return cardDue <= today;
    }).length;
    
    const averageEaseFactor = cards.length > 0 
      ? cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length 
      : 2.5;
    
    // Group cards by interval ranges
    const intervalDistribution: Record<string, number> = {
      '1 day': 0,
      '2-6 days': 0,
      '1-4 weeks': 0,
      '1+ months': 0
    };
    
    cards.forEach(card => {
      if (card.interval === 1) {
        intervalDistribution['1 day']++;
      } else if (card.interval <= 6) {
        intervalDistribution['2-6 days']++;
      } else if (card.interval <= 28) {
        intervalDistribution['1-4 weeks']++;
      } else {
        intervalDistribution['1+ months']++;
      }
    });
    
    return {
      totalCards: cards.length,
      dueToday,
      averageEaseFactor: Number(averageEaseFactor.toFixed(2)),
      intervalDistribution
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use SM2Algorithm.calculateNext instead
 */
export function scheduleNextReview(daysSinceLast: number, quality: number): number {
  // Convert to new format for calculation
  const mockCard: SRSCard = {
    id: 'legacy',
    easeFactor: 2.5,
    interval: daysSinceLast,
    repetition: daysSinceLast > 1 ? 2 : 0,
    lastReviewed: new Date(),
    nextReview: new Date(),
    totalReviews: 1
  };
  
  // Normalize quality (0-1 scale to 0-5 scale)
  const normalizedQuality = Math.round(quality * 5) as QualityRating;
  
  const result = SM2Algorithm.calculateNext(mockCard, normalizedQuality);
  return result.interval || 1;
}