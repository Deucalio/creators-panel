import { randomInt } from "node:crypto";

// Crockford-ish alphabet: no O/0, I/1 or L, so a code stays unambiguous when a
// creator reads it off a screenshot or dictates it out loud.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 4;

function randomSuffix(): string {
  let suffix = "";
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return suffix;
}

/**
 * Build a share code like `SARAH4K7P` — recognisable to the creator, and usable
 * directly as a discount code once coupon tracking lands.
 *
 * Uniqueness is enforced by the `Creator.referralCode` unique index rather than
 * here; callers retry on a P2002 collision.
 */
export function buildReferralCode(firstName: string): string {
  const base =
    firstName
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 8) || "CREATOR";

  return `${base}${randomSuffix()}`;
}
