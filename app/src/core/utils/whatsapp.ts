import { Linking } from 'react-native';

// Build a wa.me deep link with a pre-filled message. Phone must be digits only
// (wa.me rejects '+' and spaces).
export function buildWhatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Open WhatsApp (or the chooser) for the given number + message.
export async function openWhatsapp(
  phone: string,
  message: string,
): Promise<void> {
  await Linking.openURL(buildWhatsappUrl(phone, message));
}
