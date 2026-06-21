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
  requestOtp,
  signOut as signOutService,
  updateRole,
  verifyOtp,
} from '../services/auth.service';

const onboardedKey = (userId: string) => `teyvay.onboarded.${userId}`;

type AuthContextValue = {
  initializing: boolean;
  session: Session | null;
  profile: Profile | null;
  // True once authenticated but the user hasn't confirmed a role yet.
  needsOnboarding: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      session,
      profile,
      needsOnboarding,
      requestOtp,
      verifyOtp: async (phone, token) => {
        await verifyOtp(phone, token);
      },
      selectRole,
      signOut: signOutService,
    }),
    [initializing, session, profile, needsOnboarding, selectRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
