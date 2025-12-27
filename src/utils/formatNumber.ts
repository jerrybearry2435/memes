/**
 * Formats a number with appropriate suffix (K, M, B)
 * Examples: 1234 -> "1.2K", 1234567 -> "1.2M", 1234567890 -> "1.2B"
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Formats a number with commas for display
 * Example: 1234567 -> "1,234,567"
 */
export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString();
}
