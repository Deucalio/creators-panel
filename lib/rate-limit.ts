import "server-only";

import { headers } from "next/headers";
import prisma from "@/lib/db";

/**
 * Throttling for creator sign-in.
 *
 * Before this, an attacker could guess passwords against a known creator email
 * indefinitely — scrypt makes each guess slow, but slow times unlimited is
 * still unlimited.
 *
 * Two buckets, because they defend against different attacks:
 *
 * - **email** stops one account being ground down.
 * - **IP** stops one attacker sweeping many accounts, which the email bucket
 *   alone would never notice.
 *
 * The email bucket does let someone deliberately lock a creator out for the
 * window by failing on their behalf. That is the standard trade, and it is
 * strictly better than unlimited guessing: the window is short, and the IP
 * bucket catches whoever is doing it well before they can keep it up.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 8;
// Deliberately loose: an office, a school or a phone network shares one address,
// and locking all of them out to slow one attacker is a bad trade.
const MAX_PER_IP = 40;

export type RateLimitVerdict = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Caller's IP, as far as it can be known.
 *
 * `x-forwarded-for` is client-supplied and trivially spoofed unless a trusted
 * proxy overwrites it — which Vercel and most managed hosts do. Treat the IP
 * bucket as a speed bump rather than a guarantee; the email bucket is the one
 * that cannot be sidestepped by forging a header.
 */
async function callerIp(): Promise<string | null> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return store.get("x-real-ip")?.trim() || null;
}

function emailScope(email: string): string {
  return `email:${email.trim().toLowerCase()}`;
}

/**
 * Is this sign-in allowed to proceed?
 *
 * Called *before* the account lookup, so a throttled attacker never gets to
 * probe the database at all.
 */
export async function checkLoginAllowed(email: string): Promise<RateLimitVerdict> {
  const since = new Date(Date.now() - WINDOW_MS);
  const ip = await callerIp();

  // Prune first. It keeps the table bounded without a scheduled job, and it is
  // one indexed delete on a table that only ever holds a few minutes of rows.
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: since } } });

  const scopes = [emailScope(email), ...(ip ? [`ip:${ip}`] : [])];
  const limits = [MAX_PER_EMAIL, ...(ip ? [MAX_PER_IP] : [])];

  const counts = await Promise.all(
    scopes.map((scope) =>
      prisma.loginAttempt.count({ where: { scope, createdAt: { gte: since } } }),
    ),
  );

  const exceeded = counts.findIndex((count, i) => count >= limits[i]);
  if (exceeded === -1) return { allowed: true };

  // Report the wait from the oldest attempt still inside the window: that is
  // when the bucket actually drains by one.
  const oldest = await prisma.loginAttempt.findFirst({
    where: { scope: scopes[exceeded], createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const readyAt = (oldest?.createdAt.getTime() ?? Date.now()) + WINDOW_MS;
  return {
    allowed: false,
    retryAfterSeconds: Math.max(30, Math.ceil((readyAt - Date.now()) / 1000)),
  };
}

/** Record a failure against both buckets. */
export async function recordFailedLogin(email: string): Promise<void> {
  const ip = await callerIp();
  const scopes = [emailScope(email), ...(ip ? [`ip:${ip}`] : [])];

  await prisma.loginAttempt.createMany({ data: scopes.map((scope) => ({ scope })) });
}

/**
 * Clear the email bucket after a correct password.
 *
 * The IP bucket is left alone deliberately: someone working through a list of
 * accounts will hit a valid one eventually, and letting that reset their IP
 * budget would hand them a free refill exactly when they are succeeding.
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { scope: emailScope(email) } });
}

/** "12 minutes" / "45 seconds" — for telling someone how long to wait. */
export function describeWait(seconds: number): string {
  if (seconds < 90) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
