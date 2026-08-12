/**
 * Format an amount in the merchant's currency. The currency code is mirrored
 * onto the Store row by the Shopify admin app, so this portal never needs
 * Admin API credentials of its own.
 */
export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    // Intl throws on an unrecognised code rather than degrading.
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}
