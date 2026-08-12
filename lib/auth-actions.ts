"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string };

// Deliberately identical for "no such account" and "wrong password" — telling
// them apart lets an attacker enumerate which emails are registered.
const INVALID_CREDENTIALS = "Incorrect email or password.";

/** Only allow same-site relative paths, so ?redirectTo= can't bounce off-site. */
function safeRedirectTarget(target: string | undefined): string {
  if (!target) return "/dashboard";
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  return target;
}

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

  const account = await prisma.creatorAccount.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!account) {
    // Burn comparable time to a real verification, otherwise the fast path for
    // an unknown email is measurable and leaks which accounts exist.
    await hashPassword(password);
    return { status: "error", message: INVALID_CREDENTIALS, email };
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    return { status: "error", message: INVALID_CREDENTIALS, email };
  }

  await createSession(account.id);

  // Outside any try/catch: redirect() signals by throwing.
  redirect(safeRedirectTarget(redirectTo));
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/login");
}
