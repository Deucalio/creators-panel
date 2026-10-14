import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-brand-ink shadow-sm hover:bg-brand-hover active:bg-brand-hover/90 border border-transparent",
  secondary:
    "bg-surface-muted text-ink hover:bg-line-soft active:bg-line border border-line",
  outline:
    "bg-surface text-ink border border-line hover:border-ink-subtle hover:bg-surface-muted active:bg-line-soft",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-surface-muted active:bg-line-soft border border-transparent",
  danger:
    "bg-danger-surface text-danger-ink border border-danger-line hover:bg-danger-surface/80 active:bg-danger-surface/90",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm font-semibold rounded-lg gap-2",
  lg: "px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium motion-safe:transition select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
          VARIANT_STYLES[variant]
        } ${SIZE_STYLES[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon
        )}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
