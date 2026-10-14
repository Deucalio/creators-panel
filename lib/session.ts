import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { credentialStamp, deserializeSession, serializeSession } from "@/lib/session-token";

const COOKIE_NAME = "creator_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

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

/**
 * Issue a session cookie. Only callable from a Server Action or Route Handler —
 * Next.js does not allow setting cookies while rendering a Server Component.
 *
 * Takes the password hash so the session is bound to the current password:
 * changing it retires every session issued before (see `SessionPayload.pwd`).
 */
export async function createSession(account: { id: string; passwordHash: string }): Promise<void> {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    serializeSession(secret(), {
      sub: account.id,
      exp: expiresAt,
      pwd: credentialStamp(secret(), account.passwordHash),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  );
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * The signed-in account id, or null. Safe to call while rendering.
 *
 * Checks the token's credential stamp against the password hash stored now, so
 * a session from before a password change reads as signed out. That costs one
 * indexed lookup, deduplicated per request by `cache()`.
 */
export const getSessionAccountId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const payload = deserializeSession(secret(), cookieStore.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  const account = await prisma.creatorAccount.findUnique({
    where: { id: payload.sub },
    select: { passwordHash: true },
  });
  if (!account) return null;

  return payload.pwd === credentialStamp(secret(), account.passwordHash) ? payload.sub : null;
});
