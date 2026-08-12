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
      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {state.message}
        </p>
      ) : null}

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
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
