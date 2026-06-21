import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../../core/supabase';
import type { Profile, UserRole } from '../../../core/types/database';

// Request an SMS OTP for a phone number (E.164, e.g. +22231234567).
export async function requestOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

// Verify the SMS OTP. On success a session is created and persisted.
export async function verifyOtp(phone: string, token: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Fetch the caller's profile (auto-created by the 0001 trigger on signup).
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

// Persist the user's chosen role on their profile.
export async function updateRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}
