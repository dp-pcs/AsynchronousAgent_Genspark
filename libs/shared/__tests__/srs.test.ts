import { scheduleNextReview } from '../src/srs';

test('high quality should increase interval significantly', () => {
  const next = scheduleNextReview(1, 0.9);
  // This expectation will fail until the bug is fixed.
  expect(next).toBeGreaterThan(2.0);
});
