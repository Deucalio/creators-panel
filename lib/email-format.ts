/**
 * The one email check, shared by signup and the settings page so an address
 * accepted in one place is never rejected in the other. Deliberately loose —
 * the merchant's approval, not a regex, is what stands between a signup and
 * any earnings.
 */
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}
