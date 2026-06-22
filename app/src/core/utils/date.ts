// Date helpers for birthdate handling. All values use the device-local
// calendar day (no timezone shifts) and an ISO `YYYY-MM-DD` string at rest.

const pad = (n: number) => String(n).padStart(2, '0');

// Date -> "YYYY-MM-DD" using local Y/M/D (avoids the UTC off-by-one of
// toISOString()).
export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "YYYY-MM-DD" -> local Date (midnight local). Returns null for empty/invalid.
export const parseISODate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

// Whole years between a birthdate and today.
export const ageFromBirthdate = (d: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
};

// Localized human-readable date (e.g. "12 May 1990"); falls back per locale.
export const formatDisplayDate = (d: Date, locale: string): string =>
  d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
