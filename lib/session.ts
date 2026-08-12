import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "creator_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

type SessionPayload = {
  /** CreatorAccount id. */
  sub: string;
  /** Expiry, seconds since epoch. */
  exp: number;
};

function secret(): Buffer {
  const value = process.env.SESSION_SECRET;

  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env — generate one with:\n" +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))"',
    );
  }

  return Buffer.from(value, "utf8");
}

const b64 = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

/**
 * Stateless session: `<base64url payload>.<hmac>`.
 *
 * The payload is signed, not encrypted — it holds only an account id, which is
 * not secret. Tampering is what matters, and the HMAC prevents that.
 */
function serialize(payload: SessionPayload): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function deserialize(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body), "utf8");
  const received = Buffer.from(signature, "utf8");

  // Compare in constant time, and only when lengths match — timingSafeEqual
  // throws on a length mismatch rather than returning false.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;

    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Issue a session cookie. Only callable from a Server Action or Route Handler —
 * Next.js does not allow setting cookies while rendering a Server Component.
 */
export async function createSession(accountId: string): Promise<void> {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, serialize({ sub: accountId, exp: expiresAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** The signed-in account id, or null. Safe to call while rendering. */
export async function getSessionAccountId(): Promise<string | null> {
  const cookieStore = await cookies();
  return deserialize(cookieStore.get(COOKIE_NAME)?.value)?.sub ?? null;
}
