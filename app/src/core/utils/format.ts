// Format a price in Mauritanian Ouguiya (MRU). Keeps it simple and locale-light
// so it reads the same across the three app languages.
export function formatPrice(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} MRU`;
}
