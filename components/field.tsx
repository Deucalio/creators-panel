"use client";

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
};

/** Labelled input with inline validation messaging, shared by the auth forms. */
export function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  hint,
}: FieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
            : "border-zinc-300 focus:border-blue-600 focus:ring-blue-100"
        }`}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
