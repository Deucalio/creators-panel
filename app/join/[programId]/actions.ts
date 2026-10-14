"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { isValidEmail } from "@/lib/email-format";
import { NAME_MAX_LENGTH } from "@/lib/field-limits";
import {
  checkLoginAllowed,
  clearLoginAttempts,
  describeWait,
  recordFailedLogin,
} from "@/lib/rate-limit";
import { buildReferralCode } from "@/lib/referral-code";
import { createSession, getSessionAccountId } from "@/lib/session";
import { uniqueViolationTargets } from "@/lib/unique-violation";

export type RegistrationValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export type RegistrationFieldErrors = Partial<
  Record<keyof RegistrationValues | "password", string>
>;

export type RegistrationState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors: RegistrationFieldErrors;
      values: RegistrationValues;
    };

// NOTE: a "use server" module may only export async functions. Type exports are
// erased at compile time so they're fine here, but value constants (such as the
// initial form state) must live in the client component instead — exporting one
// from this file compiles and typechecks, then fails at runtime.

// Generated codes can collide; the unique index is the source of truth, so we
// just try again with a fresh suffix.
const MAX_CODE_ATTEMPTS = 5;

/**
 * Create the membership row, retrying when the generated referral code happens
 * to collide. Returns null if the account already belongs to this program.
 */
async function createMembership(accountId: string, programId: string, firstName: string) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.creator.create({
        data: {
          accountId,
          programId,
          referralCode: buildReferralCode(firstName),
          // Stays PENDING until the merchant approves it in the Shopify admin.
        },
        select: { id: true },
      });
    } catch (error) {
      const conflicting = uniqueViolationTargets(error);
      if (conflicting === null) throw error;

      if (conflicting.includes("referralCode")) continue;
      // accountId + programId — already a member of this program.
      return null;
    }
  }

  throw new Error("Exhausted referral code attempts");
}

/**
 * Register a creator into a program.
 *
 * Every input here is untrusted, `programId` included — a Server Action is
 * reachable by direct POST, not only through our own UI. Posting a different
 * program id gains nothing (every join page is public), but the program is
 * still re-checked below for existence and whether it is accepting applications.
 */
export async function registerCreator(
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const programId = String(formData.get("programId") ?? "");
  const values: RegistrationValues = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  };
  const password = String(formData.get("password") ?? "");

  const fieldErrors: RegistrationFieldErrors = {};
  if (!values.firstName) fieldErrors.firstName = "Enter your first name";
  else if (values.firstName.length > NAME_MAX_LENGTH) {
    fieldErrors.firstName = `Use ${NAME_MAX_LENGTH} characters or fewer`;
  }
  if (!values.lastName) fieldErrors.lastName = "Enter your last name";
  else if (values.lastName.length > NAME_MAX_LENGTH) {
    fieldErrors.lastName = `Use ${NAME_MAX_LENGTH} characters or fewer`;
  }
  if (!isValidEmail(values.email)) fieldErrors.email = "Enter a valid email address";
  if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true, status: true },
  });

  if (!program || program.status !== "ACTIVE") {
    return {
      status: "error",
      message: "This program is not accepting applications right now.",
      fieldErrors: {},
      values,
    };
  }

  // This form checks the password of an existing account, which makes it a
  // second sign-in form. Unthrottled, it would let anyone sidestep the login
  // limit entirely by guessing passwords here instead, so it shares the same
  // buckets — checked before the lookup, exactly as signIn does.
  const verdict = await checkLoginAllowed(values.email);
  if (!verdict.allowed) {
    return {
      status: "error",
      message: `Too many attempts. Try again in ${describeWait(verdict.retryAfterSeconds)}.`,
      fieldErrors: {},
      values,
    };
  }

  const existing = await prisma.creatorAccount.findUnique({
    where: { email: values.email },
    select: { id: true, passwordHash: true },
  });

  let account: { id: string; passwordHash: string };

  if (existing) {
    // The email already has an account, so this is an existing creator joining
    // another merchant's program. Require their real password before attaching
    // a membership — otherwise anyone could bolt a program onto someone's
    // account by guessing their email address.
    if (!(await verifyPassword(password, existing.passwordHash))) {
      await recordFailedLogin(values.email);
      return {
        status: "error",
        message:
          "An account already exists for this email. Enter its password to join this program, or sign in first.",
        fieldErrors: { password: "Incorrect password for this email" },
        values,
      };
    }

    await clearLoginAttempts(values.email);
    account = existing;
  } else {
    try {
      account = await prisma.creatorAccount.create({
        data: {
          email: values.email,
          passwordHash: await hashPassword(password),
          firstName: values.firstName,
          lastName: values.lastName,
        },
        select: { id: true, passwordHash: true },
      });
    } catch (error) {
      // Another request created the same email between our read and this write.
      if (uniqueViolationTargets(error) === null) throw error;

      return {
        status: "error",
        message: "That email was just registered. Please try again.",
        fieldErrors: {},
        values,
      };
    }
  }

  const membership = await createMembership(account.id, program.id, values.firstName);

  if (!membership) {
    return {
      status: "error",
      message: "You have already applied to this program.",
      fieldErrors: { email: "Already applied with this email" },
      values,
    };
  }

  await createSession(account);

  // Outside any try/catch: redirect() signals by throwing, so catching it here
  // would swallow the navigation.
  redirect("/dashboard");
}

export type JoinState = { status: "idle" } | { status: "error"; message: string };

/**
 * Join a program as the signed-in account — no form to fill.
 *
 * A creator already in one merchant's program used to meet the full signup form
 * here, and its "Sign in" link led to a dashboard with no way back. The session
 * already proves who they are, so it stands in for the password; everything
 * else is re-checked as in registerCreator, since this is reachable by direct
 * POST too.
 */
export async function joinAsSignedIn(_previousState: JoinState, formData: FormData): Promise<JoinState> {
  const accountId = await getSessionAccountId();
  if (!accountId) return { status: "error", message: "Your session expired. Sign in again." };

  const programId = String(formData.get("programId") ?? "");
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true, status: true },
  });
  if (!program || program.status !== "ACTIVE") {
    return { status: "error", message: "This program is not accepting applications right now." };
  }

  const account = await prisma.creatorAccount.findUnique({
    where: { id: accountId },
    select: { firstName: true },
  });
  if (!account) return { status: "error", message: "Your session expired. Sign in again." };

  const membership = await createMembership(accountId, program.id, account.firstName);
  if (!membership) return { status: "error", message: "You have already applied to this program." };

  // Outside any try/catch: redirect() signals by throwing.
  redirect(`/dashboard?program=${membership.id}`);
}
