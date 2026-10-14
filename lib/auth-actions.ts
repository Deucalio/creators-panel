"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { safeRedirectTarget } from "@/lib/safe-redirect";
import {
  checkLoginAllowed,
  recordFailedLogin,
  clearLoginAttempts,
  describeWait,
} from "@/lib/rate-limit";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string };

// Deliberately identical for "no such account" and "wrong password" — telling
// them apart lets an attacker enumerate which emails are registered.
const INVALID_CREDENTIALS = "Incorrect email or password.";

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // Posted as a hidden field, so treat it as untrusted — safeRedirectTarget
  // confines it to same-site relative paths.
  const redirectTo = String(formData.get("redirectTo") ?? "") || undefined;

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password.", email };
  }

  // Checked before the lookup, so a throttled attacker never gets to probe the
  // database at all. The wording is about the request rather than the account,
  // so it reveals nothing about whether that email is registered.
  const verdict = await checkLoginAllowed(email);
  if (!verdict.allowed) {
    return {
      status: "error",
      message: `Too many sign-in attempts. Try again in ${describeWait(verdict.retryAfterSeconds)}.`,
      email,
    };
  }

  const account = await prisma.creatorAccount.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!account) {
    // Burn comparable time to a real verification, otherwise the fast path for
    // an unknown email is measurable and leaks which accounts exist.
    await hashPassword(password);
    await recordFailedLogin(email);
    return { status: "error", message: INVALID_CREDENTIALS, email };
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    await recordFailedLogin(email);
    return { status: "error", message: INVALID_CREDENTIALS, email };
  }

  // Only the email bucket clears; see clearLoginAttempts.
  await clearLoginAttempts(email);
  await createSession(account);

  // Outside any try/catch: redirect() signals by throwing.
  redirect(safeRedirectTarget(redirectTo));
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/login");
}
