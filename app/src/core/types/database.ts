// Shared DB types. Hand-written for the core schema; can later be replaced by
// `supabase gen types typescript` output if desired.

export type UserRole = 'admin' | 'merchant' | 'client';
export type AnnouncementStatus = 'pending' | 'active' | 'sold' | 'inactive' | 'rejected';

export interface Profile {
  id: string;
  phone: string | null;
  role: UserRole;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  // Non-null = soft-deleted (account deactivated).
  deleted_at: string | null;
  created_at: string;
}

// Personal info a user can edit on their profile.
export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  age: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: AnnouncementStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Fields a merchant supplies when creating a listing.
export interface NewAnnouncement {
  title: string;
  description: string;
  price: number;
}
