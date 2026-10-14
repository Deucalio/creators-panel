"use client";

import { useActionState } from "react";
import { joinAsSignedIn, type JoinState } from "./actions";

// Lives here rather than in actions.ts: a "use server" module can only export
// async functions, so exporting this constant from there fails at runtime.
const idle: JoinState = { status: "idle" };

/**
 * The signed-in version of the application form: one button. The program id
 * travels as a hidden field and is re-checked in the action — never `.bind()`,
 * which wedges the no-JS path on this Next version (see registration-form.tsx).
 */
export function JoinAsMemberForm({
  programId,
  name,
  email,
  storeName,
}: {
  programId: string;
  name: string;
  email: string;
  storeName: string;
}) {
  const [state, formAction, pending] = useActionState(joinAsSignedIn, idle);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="programId" value={programId} />

      <div aria-live="polite" aria-atomic="true">
        {state.status === "error" ? (
          <p className="rounded-lg border border-danger-line bg-danger-surface px-4 py-3 text-sm text-danger-ink">
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-line bg-surface-muted px-4 py-3">
        <p className="text-sm font-semibold text-ink">{name}</p>
        <p className="text-xs text-ink-muted">{email}</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-ink shadow-sm transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : `Join as ${name}`}
      </button>

      <p className="text-xs leading-relaxed text-ink-subtle">
        Your application goes to {storeName} for review, and appears beside your other programs
        once you&apos;re in.
      </p>
    </form>
  );
}
