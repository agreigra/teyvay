import { supabase } from '../../../core/supabase';

const ADMIN_WHATSAPP_KEY = 'admin_whatsapp_number';

// Read a single app_settings value by key.
async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}

// Admin WhatsApp number (E.164). Used by the announcements Contact deep link.
export function getAdminWhatsappNumber(): Promise<string | null> {
  return getSetting(ADMIN_WHATSAPP_KEY);
}

// Admin-only write (enforced by RLS once 0004 lands).
export async function setAdminWhatsappNumber(value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: ADMIN_WHATSAPP_KEY, value });
  if (error) throw error;
}
