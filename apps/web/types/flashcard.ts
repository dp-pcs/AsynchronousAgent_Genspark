// Shared types for flashcard frontend

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // SRS Properties
  ease_factor: number;
  interval: number;
  repetition: number;
  last_reviewed: string | null;
  next_review: string;
  total_reviews: number;
}

export interface FlashcardCreate {
  question: string;
  answer: string;
  tags?: string[];
}

export interface ReviewRequest {
  flashcard_id: string;
  quality: number; // 0-5 SM-2 scale
  response_time: number; // milliseconds
  correct: boolean;
}

export interface ReviewResponse {
  flashcard: Flashcard;
  next_interval: number;
  ease_factor_change: number;
  message: string;
}

export interface StudySession {
  id: string;
  start_time: string;
  end_time: string | null;
  cards_reviewed: number;
  cards_correct: number;
  total_time: number;
}

export interface StudyStats {
  total_cards: number;
  due_today: number;
  total_reviews: number;
  accuracy: number;
  average_ease_factor: number;
  sessions_completed: number;
  total_study_time: number;
  interval_distribution: Record<string, number>;
  upcoming_reviews: Record<string, number>;
}

export const QUALITY_LABELS = {
  0: "Total blackout",
  1: "Incorrect", 
  2: "Difficult",
  3: "Hesitant",
  4: "Good",
  5: "Perfect"
} as const;

export type QualityRating = keyof typeof QUALITY_LABELS;