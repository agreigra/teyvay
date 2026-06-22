// Minimum password length (matches Supabase auth default).
export const MIN_PASSWORD_LENGTH = 6;

// Users must be adults to register (enforced client-side and by a DB check).
export const MIN_AGE = 18;

// Latest birthdate that still satisfies MIN_AGE — used as the date picker's
// maximumDate so under-18 dates can't be selected.
export const maxBirthdate = (): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d;
};

// Normalize a phone input: strip spaces. Expected E.164, e.g. +22231234567.
export const normalizePhone = (p: string) => p.replace(/\s/g, '');

// Basic E.164 check: leading + and 8–15 digits.
export const isValidPhone = (p: string) => /^\+\d{8,15}$/.test(normalizePhone(p));
