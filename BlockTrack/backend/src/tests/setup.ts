// Setup file for Jest tests
// This file runs before each test suite

// Suppress console output during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during testing
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
