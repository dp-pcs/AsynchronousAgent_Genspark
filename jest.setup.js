// Global Jest setup for deterministic tests

// Seed Math.random for deterministic behavior in tests
const originalRandom = Math.random;
let mockSeed = 12345;

// Seeded random number generator
function seededRandom() {
  mockSeed = (mockSeed * 9301 + 49297) % 233280;
  return mockSeed / 233280;
}

// Override Math.random in test environment only
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
  Math.random = seededRandom;
}

// Set deterministic date/time for tests that might depend on current time
const originalDate = Date;
const FIXED_DATE = new Date('2024-01-15T10:00:00.000Z');

global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(FIXED_DATE.getTime());
    } else {
      super(...args);
    }
  }
  
  static now() {
    return FIXED_DATE.getTime();
  }
};

// Restore original functions after tests (cleanup)
afterAll(() => {
  Math.random = originalRandom;
  global.Date = originalDate;
});

// Configure console output for CI
if (process.env.CI) {
  console.log = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
}