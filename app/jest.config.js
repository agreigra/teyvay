/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Run unit tests only — exclude build/output dirs.
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/assets/'],
  // jest-expo ships flow/TS source for some native modules; let Babel transform
  // the RN / Expo / community packages instead of treating them as plain JS.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/core/types/**',
    '!src/**/*.d.ts',
  ],
};
