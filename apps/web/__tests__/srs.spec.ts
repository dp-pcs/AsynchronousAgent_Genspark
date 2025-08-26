import { scheduleNextReview } from '../../../libs/shared/src/srs';
test('srs schedule increases interval', () => {
  // This test will fail until the import path and logic are corrected.
  const next = scheduleNextReview(1, 0.3); // (days, qualityScore)
  expect(next).toBeGreaterThan(1);
});
