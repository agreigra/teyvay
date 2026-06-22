import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../../core/supabase';
import type { Profile, UserRole } from '../../../core/types/database';

// --- Registration (first time): phone + password, confirmed via SMS OTP -------

// Personal info collected at registration; lands in user metadata and is copied
// into the profile by the 0005 trigger.
export type SignUpMeta = {
  first_name: string;
  last_name: string;
  // ISO YYYY-MM-DD; the DB trigger derives age from it.
  birthdate: string;
};

// Create an account. With phone confirmations enabled, no session is returned
// until the OTP is verified.
export async function signUpWithPassword(
  phone: string,
  password: string,
  meta?: SignUpMeta,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    phone,
    password,
    options: meta ? { data: meta } : undefined,
  });
  if (error) throw error;
}

// --- Normal login: phone + password (no OTP) ----------------------------------

export async function signInWithPassword(
  phone: string,
  password: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });
  if (error) throw error;
  return data.session;
}

// --- OTP: used for first-time confirmation and password recovery only ---------

// Send an SMS OTP. shouldCreateUser=false for recovery (must already exist).
export async function requestOtp(
  phone: string,
  shouldCreateUser = false,
): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser },
  });
  if (error) throw error;
}

export async function verifyOtp(
  phone: string,
  token: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.session;
}

// Set a new password for the currently-authenticated user (recovery flow).
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// Thrown by changePassword when the supplied current password is wrong.
export class WrongPasswordError extends Error {}

// Change password from the profile: re-authenticate with the current password
// first (Supabase's updateUser doesn't verify it), then set the new one.
export async function changePassword(
  phone: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    phone,
    password: currentPassword,
  });
  if (signInError) throw new WrongPasswordError();
  await updatePassword(newPassword);
}

// --- Session / profile --------------------------------------------------------

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
