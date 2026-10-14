"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/lib/auth-actions";
import { Field } from "@/components/field";

const initialLoginState: LoginState = { status: "idle" };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialLoginState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      {/* The region is always present; only its content changes */}
      <div aria-live="polite" aria-atomic="true">
        {state.status === "error" ? (
          <p className="rounded-xl border border-danger-line bg-danger-surface px-4 py-3 text-xs font-medium text-danger shadow-2xs">
            {state.message}
          </p>
        ) : null}
      </div>

      <Field
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        defaultValue={state.status === "error" ? state.email : undefined}
      />

      <Field name="password" label="Password" type="password" autoComplete="current-password" />

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
