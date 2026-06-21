// Shared DB types. Hand-written for the core schema; can later be replaced by
// `supabase gen types typescript` output if desired.

export type UserRole = 'admin' | 'sailor' | 'client';
export type AnnouncementStatus = 'active' | 'sold' | 'inactive';

export interface Profile {
  id: string;
  phone: string | null;
  role: UserRole;
  display_name: string | null;
  created_at: string;
}
