// Global Jest setup — runs before every test file.

// 1. Dummy Supabase env vars. `src/core/supabase/env.ts` throws at import time
//    if these are missing, which would crash any test that transitively imports
//    the client. Real values are never needed in unit tests.
process.env.EXPO_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';

// 2. AsyncStorage — official in-memory mock so auth/session code doesn't hit
//    native storage during tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
