/**
 * How merchants pay creators. There is no payment provider: the merchant sends
 * the money by hand and records it in the Shopify app, so these are the only
 * methods offered. The Shopify app keeps the same list in
 * `app/payout-methods.js` — change both together.
 */
export const PAYOUT_METHODS = ["Easypaisa", "JazzCash", "Bank transfer"] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

/**
 * The listed method a stored or submitted value means, or null.
 *
 * Accounts created before the list existed saved free text ("easy paisa",
 * "Meezan bank"), so this ignores case, spaces and hyphens rather than demanding
 * an exact match. Anything else ("Wise", "PayPal") is not a method a merchant
 * can pay through, and comes back null.
 */
export function matchPayoutMethod(value: string | null | undefined): PayoutMethod | null {
  const key = (value ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (!key) return null;
  if (key.includes("easypaisa")) return "Easypaisa";
  if (key.includes("jazzcash")) return "JazzCash";
  if (key.includes("bank") || key.includes("iban")) return "Bank transfer";
  return null;
}

/** What the details box asks for under each method. */
export const PAYOUT_DETAILS_PROMPT: Record<PayoutMethod, string> = {
  Easypaisa: "Account holder name:\nEasypaisa mobile number (03XX XXXXXXX):",
  JazzCash: "Account holder name:\nJazzCash mobile number (03XX XXXXXXX):",
  "Bank transfer": "Account title:\nBank name:\nIBAN or account number:",
};
