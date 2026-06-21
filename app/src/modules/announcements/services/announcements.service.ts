import { supabase } from '../../../core/supabase';
import type {
  Announcement,
  AnnouncementStatus,
  NewAnnouncement,
} from '../../../core/types/database';

const TABLE = 'announcements';
const COLUMNS = 'id,title,description,price,status,created_by,created_at,updated_at';

// Active listings, newest first (client / browse view).
export async function listActive(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Announcement[]) ?? [];
}

// All listings, newest first (admin view).
export async function listAll(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Announcement[]) ?? [];
}

// A merchant's own listings, newest first.
export async function listMine(userId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Announcement[]) ?? [];
}

export async function getById(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Announcement) ?? null;
}

export async function create(
  userId: string,
  input: NewAnnouncement,
): Promise<Announcement> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, created_by: userId })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Announcement;
}

export async function setStatus(
  id: string,
  status: AnnouncementStatus,
): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ status }).eq('id', id);
  if (error) throw error;
}

// Edit a listing's content (title/description/price). Status is changed
// separately via setStatus.
export async function update(
  id: string,
  input: NewAnnouncement,
): Promise<Announcement> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Announcement;
}
