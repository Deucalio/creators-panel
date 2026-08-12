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

      {formMessage ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {formMessage}
        </p>
      ) : null}

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
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Apply to join"}
      </button>

      <p className="text-xs leading-relaxed text-zinc-500">
        Your application goes to {storeName} for review. Already have a PartnerLoop account?{" "}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          Sign in
        </Link>{" "}
        — use the same password above to join this program.
      </p>
    </form>
  );
}
