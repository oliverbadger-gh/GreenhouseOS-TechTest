/**
 * Format a number as GBP currency (e.g. £1,250,000).
 */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate the number of whole days between a given ISO date string and now.
 */
export function daysOnMarket(listedDate: string): number {
  const listed = new Date(listedDate);
  const now = new Date();
  const diffMs = now.getTime() - listed.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
