import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../../core/supabase';
import type { Profile, UserRole } from '../../../core/types/database';
import {
  fetchProfile,
  signOut as signOutService,
  updateRole,
} from '../services/auth.service';

const onboardedKey = (userId: string) => `teyvay.onboarded.${userId}`;

type AuthContextValue = {
  initializing: boolean;
  session: Session | null;
  profile: Profile | null;
  // True once authenticated but the user hasn't confirmed a role yet.
  needsOnboarding: boolean;
  // True while in the forgot-password flow: a recovery OTP has (or will) create
  // a session, but the user must set a new password before entering the app.
  passwordResetPending: boolean;
  beginPasswordReset: () => void;
  completePasswordReset: () => void;
  // Guests browse without a session; openAuth() reveals the sign-in flow on
  // demand, closeAuth() returns them to public browsing.
  authPrompt: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  selectRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [passwordResetPending, setPasswordResetPending] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);

  // Load profile + onboarding flag for a signed-in user.
  const loadUser = useCallback(async (userId: string) => {
    const [prof, onboarded] = await Promise.all([
      fetchProfile(userId),
      AsyncStorage.getItem(onboardedKey(userId)),
    ]);
    setProfile(prof);
    setNeedsOnboarding(onboarded == null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadUser(data.session.user.id);
      }
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        await loadUser(s.user.id);
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
        setPasswordResetPending(false);
        setAuthPrompt(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUser]);

  const selectRole = useCallback(
    async (role: UserRole) => {
      if (!session?.user) return;
      await updateRole(session.user.id, role);
      await AsyncStorage.setItem(onboardedKey(session.user.id), '1');
      await loadUser(session.user.id);
      setNeedsOnboarding(false);
    },
    [session, loadUser],
  );

  const beginPasswordReset = useCallback(() => setPasswordResetPending(true), []);
  const completePasswordReset = useCallback(
    () => setPasswordResetPending(false),
    [],
  );
  const openAuth = useCallback(() => setAuthPrompt(true), []);
  const closeAuth = useCallback(() => setAuthPrompt(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      session,
      profile,
      needsOnboarding,
      passwordResetPending,
      beginPasswordReset,
      completePasswordReset,
      authPrompt,
      openAuth,
      closeAuth,
      selectRole,
      signOut: signOutService,
    }),
    [
      initializing,
      session,
      profile,
      needsOnboarding,
      passwordResetPending,
      beginPasswordReset,
      completePasswordReset,
      authPrompt,
      openAuth,
      closeAuth,
      selectRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
