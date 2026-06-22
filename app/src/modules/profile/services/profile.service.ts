import { supabase } from '../../../core/supabase';
import type { ProfileUpdate } from '../../../core/types/database';
import { ageFromBirthdate, parseISODate } from '../../../core/utils/date';

const TABLE = 'profiles';

// Save edited personal info. display_name is kept in sync with the name parts;
// `age` is derived from birthdate so the legacy column stays consistent.
export async function updateProfile(
  userId: string,
  input: ProfileUpdate,
): Promise<void> {
  const display_name =
    [input.first_name, input.last_name].map((s) => s.trim()).filter(Boolean).join(' ') ||
    null;
  const parsed = parseISODate(input.birthdate);
  const { error } = await supabase
    .from(TABLE)
    .update({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      birthdate: input.birthdate,
      age: parsed ? ageFromBirthdate(parsed) : null,
      display_name,
    })
    .eq('id', userId);
  if (error) throw error;
}

// Soft delete: deactivate the account (data hidden; caller signs the user out).
export async function softDeleteProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

// Reactivate a previously soft-deleted account.
export async function reactivateProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null })
    .eq('id', userId);
  if (error) throw error;
}
