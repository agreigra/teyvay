// Minimum password length (matches Supabase auth default).
export const MIN_PASSWORD_LENGTH = 6;

// Normalize a phone input: strip spaces. Expected E.164, e.g. +22231234567.
export const normalizePhone = (p: string) => p.replace(/\s/g, '');

// Basic E.164 check: leading + and 8–15 digits.
export const isValidPhone = (p: string) => /^\+\d{8,15}$/.test(normalizePhone(p));
