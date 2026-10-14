import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The signed session token, independent of cookies and the database so it can
 * be tested directly. `lib/session.ts` is the cookie-and-lookup wrapper.
 *
 * Format: `<base64url payload>.<hmac>`. The payload is signed, not encrypted —
 * it holds nothing secret. Tampering is what matters, and the HMAC prevents it.
 */

export type SessionPayload = {
  /** CreatorAccount id. */
  sub: string;
  /** Expiry, seconds since epoch. */
  exp: number;
  /**
   * Credential stamp: derived from the account's password hash at sign-in.
   *
   * Without it a stateless session cannot be revoked — changing a password
   * would leave every other signed-in browser signed in for up to 30 days,
   * including whoever prompted the change. Each request compares this against
   * the hash currently stored, so a new password retires every older session
   * at once with no session table to maintain.
   */
  pwd: string;
};

const b64 = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function sign(secret: Buffer, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

/**
 * A short, one-way stamp of a password hash. Keyed with the session secret so
 * the cookie — which the creator can read — reveals nothing about the hash.
 */
export function credentialStamp(secret: Buffer, passwordHash: string): string {
  return createHmac("sha256", secret).update(`pwd:${passwordHash}`).digest("base64url").slice(0, 22);
}

export function serializeSession(secret: Buffer, payload: SessionPayload): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(secret, body)}`;
}

/** The payload if the token is authentic and unexpired, else null. Never throws. */
export function deserializeSession(
  secret: Buffer,
  token: string | undefined,
  now: number = Date.now(),
): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(secret, body), "utf8");
  const received = Buffer.from(signature, "utf8");

  // Compare in constant time, and only when lengths match — timingSafeEqual
  // throws on a length mismatch rather than returning false.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;

    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    // Tokens from before the stamp existed carry none and are refused, which
    // signs those browsers out once rather than leaving them unrevocable.
    if (typeof payload.pwd !== "string") return null;
    if (payload.exp * 1000 < now) return null;

    return payload;
  } catch {
    return null;
  }
}
