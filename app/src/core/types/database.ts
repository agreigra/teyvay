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
  // Optional contact email (not the auth identifier).
  email: string | null;
  // ISO YYYY-MM-DD; source of truth for age. `age` is derived for convenience.
  birthdate: string | null;
  age: number | null;
  // Non-null = soft-deleted (account deactivated).
  deleted_at: string | null;
  created_at: string;
}

// Personal info a user can edit on their profile.
export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  birthdate: string;
  // Optional; empty becomes null.
  email: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  // Optional translations of the title/description (primary content is Arabic).
  title_fr: string | null;
  description_fr: string | null;
  title_en: string | null;
  description_en: string | null;
  price: number;
  quantity: number | null;
  status: AnnouncementStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Fields a merchant supplies when creating/editing a listing.
export interface NewAnnouncement {
  title: string;
  description: string;
  title_fr: string | null;
  description_fr: string | null;
  title_en: string | null;
  description_en: string | null;
  price: number;
  quantity: number | null;
}
