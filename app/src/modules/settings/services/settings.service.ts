import { supabase } from '../../../core/supabase';

// Orders / listing-contact line.
const ADMIN_WHATSAPP_KEY = 'admin_whatsapp_number';
// Help & problem-report line (kept separate so it can differ from orders).
const SUPPORT_WHATSAPP_KEY = 'support_whatsapp_number';

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

// Admin-only write (enforced by RLS: read all, write admin).
async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from('app_settings').upsert({ key, value });
  if (error) throw error;
}

// Orders WhatsApp number (E.164). Used by the listing Contact deep link.
export function getAdminWhatsappNumber(): Promise<string | null> {
  return getSetting(ADMIN_WHATSAPP_KEY);
}

export function setAdminWhatsappNumber(value: string): Promise<void> {
  return setSetting(ADMIN_WHATSAPP_KEY, value);
}

// Support WhatsApp number (E.164). Used by the support & report flows.
export function getSupportWhatsappNumber(): Promise<string | null> {
  return getSetting(SUPPORT_WHATSAPP_KEY);
}

export function setSupportWhatsappNumber(value: string): Promise<void> {
  return setSetting(SUPPORT_WHATSAPP_KEY, value);
}
