/**
 * The longest values the account forms accept.
 *
 * The inputs carry the same `maxLength`, but a request can skip the browser, so
 * the server actions check these too. Without that, a hand-made request could
 * store a name or payout detail of any length — and merchants read both.
 */
export const NAME_MAX_LENGTH = 40;

/** An account title or bank name. Mobile numbers and IBANs have their own formats. */
export const PAYOUT_TEXT_MAX_LENGTH = 80;

/** The longest address the email standard allows. */
export const EMAIL_MAX_LENGTH = 254;
