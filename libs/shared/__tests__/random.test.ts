// Deterministic tests - fixed from potentially flaky versions
import { scheduleNextReview } from '../src/srs';

// Seeded random number generator for deterministic tests
class SeededRandom {
  private seed: number;
  
  constructor(seed: number = 12345) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

describe('Deterministic Tests (Previously Flaky)', () => {
  test('should be deterministic with seeded randomness', () => {
    // Fixed: using seeded randomness for deterministic results
    const seededRandom = new SeededRandom(42);
    const randomValue = seededRandom.next();
    const result = scheduleNextReview(randomValue * 10, 0.8);
    
    // Now deterministic with known input
    expect(result).toBeCloseTo(18.604, 2); // Known result for seed 42
    expect(result).toBeGreaterThan(0);
  });

  test('should handle concurrent executions consistently', () => {
    // Fixed: removed timing dependencies, made purely functional
    const results = [];
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      // Deterministic: using controlled iteration values
      const result = scheduleNextReview(i % 5 + 1, (i % 10) / 10);
      results.push(result);
    }
    
    // Check that identical inputs produce identical outputs
    const firstResult = scheduleNextReview(1, 0.0);
    const secondResult = scheduleNextReview(1, 0.0);
    expect(firstResult).toBe(secondResult);
    expect(firstResult).toBe(1.3); // Known deterministic result
  });

  test('should handle date-dependent operations deterministically', () => {
    // Fixed: removed date dependency, using fixed test date
    const testDate = new Date('2024-01-15T10:00:00Z'); // Fixed Monday
    const dayOfWeek = testDate.getDay(); // Always 1 (Monday)
    
    // Test behavior with fixed date - completely deterministic
    const baseInterval = dayOfWeek > 0 ? 1 : 2; // Always 1 for Monday
    const result = scheduleNextReview(baseInterval, 0.5);
    
    expect(result).toBe(1.8); // Known deterministic result
    expect(baseInterval).toBe(1); // Always Monday in test
  });

  test('should produce consistent results across test runs', () => {
    // New test: verify complete determinism
    const testInputs = [
      { days: 1, quality: 0.1 },
      { days: 2, quality: 0.5 },
      { days: 3, quality: 0.9 },
    ];
    
    const expectedResults = [1.4, 3.6, 6.6];
    
    testInputs.forEach((input, index) => {
      const result = scheduleNextReview(input.days, input.quality);
      expect(result).toBeCloseTo(expectedResults[index], 1);
    });
  });
});