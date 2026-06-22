// Phase 0 smoke test: proves the jest-expo harness is wired up correctly.
// Replaced/expanded by the real unit tests in later phases.

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('has Supabase env vars stubbed by jest.setup', () => {
    expect(process.env.EXPO_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
  });
});
