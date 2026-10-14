"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  defaultValue?: string;
  error?: string;
  hint?: string;
};

/** Labelled input with inline validation messaging, shared across forms. */
export function Field({
  name,
  label,
  type = "text",
  autoComplete,
  maxLength,
  defaultValue,
  error,
  hint,
}: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  const isPassword = type === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={effectiveType}
          autoComplete={autoComplete}
          maxLength={maxLength}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 ${isPassword ? "pr-11" : ""} text-base sm:text-sm text-ink outline-none transition placeholder:text-ink-subtle shadow-2xs focus:ring-2 ${
            error
              ? "border-danger-line focus:border-danger-ink focus:ring-danger-surface"
              : "border-line focus:border-brand focus:ring-brand/30"
          }`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-subtle hover:text-ink rounded-lg focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
