// Legacy SRS function - maintained for backward compatibility
// For new implementations, use the enhanced SM2Algorithm in ./srs/algorithm.ts

export function scheduleNextReview(daysSinceLast: number, quality: number): number {
  // Fixed: factor increases with quality as expected
  const factor = Math.max(1.1, 1.3 + quality); // now increases with quality as intended
  return Math.max(1, daysSinceLast * factor);
}

// Re-export new SRS implementation for easy access
export { SM2Algorithm } from './srs/algorithm';
export { StudyScheduler } from './srs/scheduler';
export * from './srs/types';
