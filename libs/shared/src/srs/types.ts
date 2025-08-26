// Shared types for Spaced Repetition System

export interface SRSCard {
  id: string;
  easeFactor: number;    // Default: 2.5, range: 1.3-5.0
  interval: number;      // Days until next review
  repetition: number;    // Number of successful reviews in a row
  lastReviewed: Date | null;
  nextReview: Date;
  totalReviews: number;  // Total number of reviews (including failed ones)
}

export interface ReviewResult {
  flashcardId: string;
  quality: number;       // 0-5 (SM-2 quality scale)
  responseTime: number;  // Time taken to answer (ms)
  correct: boolean;      // Whether answer was correct
  reviewedAt: Date;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  cardsReviewed: number;
  cardsCorrect: number;
  totalTime: number;     // Total study time in ms
  results: ReviewResult[];
}

export interface SRSStats {
  totalCards: number;
  dueToday: number;
  reviewsCompleted: number;
  averageEaseFactor: number;
  longestStreak: number;
  currentStreak: number;
}

// SM-2 Quality ratings with descriptions
export const QUALITY_RATINGS = {
  0: { label: "Total blackout", description: "Complete failure to recall" },
  1: { label: "Incorrect", description: "Incorrect response, but remembered upon seeing answer" },
  2: { label: "Difficult", description: "Correct response with serious difficulty" },
  3: { label: "Hesitant", description: "Correct response with some hesitation" },
  4: { label: "Good", description: "Correct response with minor hesitation" },
  5: { label: "Perfect", description: "Perfect response with no hesitation" }
} as const;

export type QualityRating = keyof typeof QUALITY_RATINGS;