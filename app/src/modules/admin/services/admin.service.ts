import { supabase } from '../../../core/supabase';
import type { Profile, UserRole } from '../../../core/types/database';

const TABLE = 'profiles';
const COLUMNS = 'id,phone,role,display_name,created_at';

// All users, newest first (admin user management).
export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

// Change a user's role (admin only; enforced by RLS in a later step).
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ role }).eq('id', userId);
  if (error) throw error;
}
