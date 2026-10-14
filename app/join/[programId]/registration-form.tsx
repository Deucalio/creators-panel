"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  registerCreator,
  type RegistrationFieldErrors,
  type RegistrationState,
  type RegistrationValues,
} from "./actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { Field } from "@/components/field";

// Lives here rather than in actions.ts: a "use server" module can only export
// async functions, so exporting this constant from there fails at runtime.
const initialRegistrationState: RegistrationState = { status: "idle" };

type Props = {
  programId: string;
  storeName: string;
};

export function RegistrationForm({ programId, storeName }: Props) {
  // NOTE: do not wrap this in `.bind()`. On Next 16.3.0 a bound Server Action
  // used with useActionState never responds on the no-JS progressive-enhancement
  // path and wedges the server process. Pass arguments as hidden fields instead
  // and re-validate them in the action.
  const [state, formAction, pending] = useActionState(registerCreator, initialRegistrationState);

  const fieldErrors: RegistrationFieldErrors = state.status === "error" ? state.fieldErrors : {};
  const values: Partial<RegistrationValues> = state.status === "error" ? state.values : {};
  const formMessage = state.status === "error" ? state.message : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="programId" value={programId} />

      {/* The region is always present; only its content changes. A live region
          created at the same instant as its message is usually not announced. */}
      <div aria-live="polite" aria-atomic="true">
        {formMessage ? (
          <p className="rounded-lg border border-danger-line bg-danger-surface px-4 py-3 text-sm text-danger-ink">
            {formMessage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="firstName"
          label="First name"
          autoComplete="given-name"
          defaultValue={values.firstName}
          error={fieldErrors.firstName}
        />
        <Field
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          defaultValue={values.lastName}
          error={fieldErrors.lastName}
        />
      </div>

      <Field
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        defaultValue={values.email}
        error={fieldErrors.email}
      />

      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters. You'll use this to sign in and track your earnings.`}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-ink shadow-sm transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Apply to join"}
      </button>

      <p className="text-xs leading-relaxed text-ink-subtle">
        Your application goes to {storeName} for review. Already have a PartnerLoop account?{" "}
        {/* Back to this page after signing in, where joining is one click. It
            used to land on the dashboard, which has no way to join anything. */}
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/join/${programId}`)}`}
          className="font-semibold text-brand-text hover:underline"
        >
          Sign in to join with it
        </Link>
        .
      </p>
    </form>
  );
}
