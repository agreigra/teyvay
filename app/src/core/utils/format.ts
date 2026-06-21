// Mauritanian Ouguiya. Kept locale-light so it reads the same across languages.
export const CURRENCY = 'MRU';

// Grouped amount without the currency suffix (e.g. "1,000,000").
export function formatAmount(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Amount + currency (e.g. "1,000,000 MRU").
export function formatPrice(amount: number): string {
  return `${formatAmount(amount)} ${CURRENCY}`;
}

// Short human-friendly reference derived from a listing id (e.g. "TF-9A3C").
export function refCode(id: string): string {
  const tail = id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `TF-${tail}`;
}
