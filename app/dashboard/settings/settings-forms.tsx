"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  updatePayoutDetails,
  removePayoutDetails,
  type FormState,
} from "./actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { Field } from "@/components/field";

// Lives here, not in actions.ts: a "use server" module can only export async
// functions, so exporting this constant from there fails at runtime.
const idle: FormState = { status: "idle" };

// NOTE: never wrap these actions in `.bind()`. On Next 16.3.0 a bound Server
// Action used with useActionState never responds on the no-JS progressive
// enhancement path and wedges the server process. Everything the action needs
// comes from form fields.

/**
 * The live region is always in the DOM; only its contents change.
 */
function Feedback({ state }: { state: FormState }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status !== "idle") ref.current?.focus();
  }, [state]);

  const error = state.status === "error";

  return (
    <div aria-live="polite" aria-atomic="true">
      {state.status === "idle" ? null : (
        <p
          ref={ref}
          tabIndex={-1}
          className={`rounded-xl border px-4 py-3 text-xs font-medium outline-none shadow-2xs ${
            error
              ? "border-danger-line bg-danger-surface text-danger"
              : "border-ok-line bg-ok-surface text-ok"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex w-fit items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

/** Field-level error only when the action blamed that field. */
function errorFor(state: FormState, field: string): string | undefined {
  return state.status === "error" && state.field === field ? state.message : undefined;
}

export function ProfileForm({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [state, action, pending] = useActionState(updateProfile, idle);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Feedback state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="firstName"
          label="First name"
          autoComplete="given-name"
          defaultValue={firstName}
          error={errorFor(state, "firstName")}
        />
        <Field name="lastName" label="Last name" autoComplete="family-name" defaultValue={lastName} />
      </div>
      <Submit pending={pending}>Save name</Submit>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(updateEmail, idle);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Feedback state={state} />
      <Field
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        defaultValue={email}
        error={errorFor(state, "email")}
        hint="This is what you sign in with."
      />
      <Field
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errorFor(state, "currentPassword")}
        hint="Required — changing your email changes how you sign in."
      />
      <Submit pending={pending}>Change email</Submit>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, idle);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Feedback state={state} />
      <Field
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errorFor(state, "currentPassword")}
      />
      <Field
        name="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errorFor(state, "newPassword")}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      />
      <Field
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errorFor(state, "confirmPassword")}
      />
      <Submit pending={pending}>Change password</Submit>
    </form>
  );
}

export function PayoutForm({
  payoutMethod,
  payoutDetails,
}: {
  payoutMethod: string;
  payoutDetails: string;
}) {
  const [state, action, pending] = useActionState(updatePayoutDetails, idle);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Feedback state={state} />
      <Field
        name="payoutMethod"
        label="Payment method"
        defaultValue={payoutMethod}
        error={errorFor(state, "payoutMethod")}
        hint="For example: Bank transfer, Wise, Easypaisa, or PayPal."
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payoutDetails" className="text-xs font-semibold text-ink">
          Account & payment details
        </label>
        <textarea
          id="payoutDetails"
          name="payoutDetails"
          rows={4}
          defaultValue={payoutDetails}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-ink-subtle shadow-2xs focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="For bank accounts:
Bank Name: 
Account Title: 
IBAN / Account Number: 

For Wise / digital wallets:
Account Email or Wallet ID: "
        />
        <p className="text-xs leading-relaxed text-ink-subtle">
          Only merchants running programs you belong to can view this information, and only when preparing your payout.
        </p>
      </div>

      <Submit pending={pending}>Save payout details</Submit>
    </form>
  );
}

/**
 * Deletion, separated from saving and behind its own confirmation.
 */
export function RemovePayoutForm({ hasDetails }: { hasDetails: boolean }) {
  const [state, action, pending] = useActionState(removePayoutDetails, idle);
  const [confirming, setConfirming] = useState(false);

  if (!hasDetails && state.status !== "success") return null;

  return (
    <form action={action} className="mt-6 flex flex-col gap-3 border-t border-line-soft pt-5">
      <Feedback state={state} />

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-xl border border-warn-line bg-warn-surface/40 p-4">
          <p className="text-xs text-ink leading-relaxed">
            Remove your saved payment details? Merchants won&apos;t know where to send your money
            until you provide payment details again.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Removing…" : "Yes, remove them"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition hover:border-line-strong hover:bg-surface-muted cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-fit text-xs font-semibold text-danger transition hover:underline cursor-pointer"
        >
          Remove payout details
        </button>
      )}
    </form>
  );
}
