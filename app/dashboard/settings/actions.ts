"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { createSession, getSessionAccountId } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { isValidEmail } from "@/lib/email-format";
import { checkLoginAllowed, describeWait, recordFailedLogin } from "@/lib/rate-limit";
import { uniqueViolationTargets } from "@/lib/unique-violation";
import { matchPayoutMethod } from "@/lib/payout-methods";

/**
 * A "use server" module may only export async functions. Constants — including
 * the initial form state — belong in the client component that uses them;
 * exporting an object from here compiles and typechecks and then throws at
 * runtime. That has bitten this project four times.
 */

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; field?: string };

const NOT_SIGNED_IN: FormState = {
  status: "error",
  message: "Your session expired. Sign in again.",
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Check the current password behind a sensitive change, under the same limit
 * as sign-in. These forms exist for the borrowed-unlocked-browser case; without
 * a limit, whoever borrowed it could simply guess the password here until the
 * gate opened, then move the account to an address they control.
 */
async function confirmCurrentPassword(
  account: { email: string; passwordHash: string },
  password: string,
): Promise<FormState | null> {
  const verdict = await checkLoginAllowed(account.email);
  if (!verdict.allowed) {
    return {
      status: "error",
      message: `Too many incorrect attempts. Try again in ${describeWait(verdict.retryAfterSeconds)}.`,
      field: "currentPassword",
    };
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    await recordFailedLogin(account.email);
    return { status: "error", message: "That password is incorrect.", field: "currentPassword" };
  }

  return null;
}

export async function updateProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return NOT_SIGNED_IN;

  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");

  if (!firstName || !lastName) {
    return { status: "error", message: "Enter both your first and last name.", field: "firstName" };
  }

  await prisma.creatorAccount.update({
    where: { id: accountId },
    data: { firstName, lastName },
  });

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Name updated." };
}

/**
 * Changing the email changes how the creator signs in, so it is gated on the
 * current password — otherwise anyone borrowing an unlocked browser could
 * quietly move the account to an address they control.
 */
export async function updateEmail(_previous: FormState, formData: FormData): Promise<FormState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return NOT_SIGNED_IN;

  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("currentPassword") ?? "");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address.", field: "email" };
  }
  if (!password) {
    return {
      status: "error",
      message: "Enter your current password to change your email.",
      field: "currentPassword",
    };
  }

  const account = await prisma.creatorAccount.findUnique({
    where: { id: accountId },
    select: { passwordHash: true, email: true },
  });
  if (!account) return NOT_SIGNED_IN;

  const refused = await confirmCurrentPassword(account, password);
  if (refused) return refused;

  if (email === account.email) {
    return { status: "success", message: "That's already your email address." };
  }

  try {
    await prisma.creatorAccount.update({ where: { id: accountId }, data: { email } });
  } catch (error) {
    // Let the unique index decide rather than checking first — a check-then-write
    // races against a concurrent signup, the index cannot.
    if (uniqueViolationTargets(error)?.includes("email")) {
      return {
        status: "error",
        message: "Another account already uses that email address.",
        field: "email",
      };
    }
    throw error;
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Email updated. Use it next time you sign in." };
}

export async function updatePassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return NOT_SIGNED_IN;

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current) {
    return { status: "error", message: "Enter your current password.", field: "currentPassword" };
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "error",
      message: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      field: "newPassword",
    };
  }
  if (next !== confirm) {
    return { status: "error", message: "The two new passwords don't match.", field: "confirmPassword" };
  }

  const account = await prisma.creatorAccount.findUnique({
    where: { id: accountId },
    select: { passwordHash: true, email: true },
  });
  if (!account) return NOT_SIGNED_IN;

  const refused = await confirmCurrentPassword(account, current);
  if (refused) return refused;

  const passwordHash = await hashPassword(next);
  await prisma.creatorAccount.update({ where: { id: accountId }, data: { passwordHash } });

  // Sessions are stamped with the password they were issued under, so the
  // update above has just signed out every other browser — the point of
  // changing a password after a suspected leak. Re-issue this one so the tab
  // the creator is typing in stays signed in.
  await createSession({ id: accountId, passwordHash });
  return {
    status: "success",
    message: "Password updated. Any other devices signed in to this account have been signed out.",
  };
}

/**
 * How this creator wants to be paid. Merchants pay by hand, through Easypaisa,
 * JazzCash or a bank transfer, so the method must be one of those and is stored
 * in its listed spelling. The details stay free text: a wallet number and an
 * IBAN don't share a shape.
 */
export async function updatePayoutDetails(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return NOT_SIGNED_IN;

  const submittedMethod = text(formData, "payoutMethod");
  const method = matchPayoutMethod(submittedMethod);
  const details = text(formData, "payoutDetails");

  if (submittedMethod && !method) {
    return {
      status: "error",
      message: "Choose Easypaisa, JazzCash or Bank transfer.",
      field: "payoutMethod",
    };
  }

  if (details && !method) {
    return {
      status: "error",
      message: "Say which method these details are for.",
      field: "payoutMethod",
    };
  }

  // Saving an empty form used to delete whatever was stored, silently. Clearing
  // bank details by accident is not a mistake someone notices until a payout
  // goes missing, so removal is now its own deliberate action.
  if (!method && !details) {
    const existing = await prisma.creatorAccount.findUnique({
      where: { id: accountId },
      select: { payoutMethod: true, payoutDetails: true },
    });

    if (existing?.payoutMethod || existing?.payoutDetails) {
      return {
        status: "error",
        message:
          "Nothing to save. To delete what's stored, use Remove payout details below.",
        field: "payoutMethod",
      };
    }

    return { status: "success", message: "Nothing to save yet." };
  }

  await prisma.creatorAccount.update({
    where: { id: accountId },
    // Empty strings become null so "not provided" is one state in the database
    // rather than two the merchant's UI would have to tell apart.
    data: { payoutMethod: method || null, payoutDetails: details || null },
  });

  revalidatePath("/dashboard/settings");
  return { status: "success", message: "Payout details saved." };
}

/** Deliberate deletion, reached only through an explicit confirmation. */
// No parameters: this action needs neither the previous state nor any field.
// A narrower arity is assignable to what useActionState expects, and declaring
// unused ones only to satisfy the shape trips no-unused-vars.
export async function removePayoutDetails(): Promise<FormState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return NOT_SIGNED_IN;

  await prisma.creatorAccount.update({
    where: { id: accountId },
    data: { payoutMethod: null, payoutDetails: null },
  });

  revalidatePath("/dashboard/settings");
  return {
    status: "success",
    message: "Payout details removed. Merchants won't see how to pay you until you add them again.",
  };
}
