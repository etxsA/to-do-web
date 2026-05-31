/** Format a 0–100 progress value with at most 2 decimals (drops trailing zeros).
 *  e.g. 33.33333 → "33.33", 65 → "65", 50.5 → "50.5". */
export function formatPercent(n: number): string {
  return String(Math.round(n * 100) / 100)
}
