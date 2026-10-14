"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";

type Theme = "system" | "light" | "dark";

const THEME_KEY = "partnerloop-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "system";
  const val = localStorage.getItem(THEME_KEY);
  if (val === "light" || val === "dark" || val === "system") return val;
  return "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const changeTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    const root = document.documentElement;
    if (newTheme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", newTheme);
    }
    // Dispatch a storage event so all instances update immediately
    window.dispatchEvent(new Event("storage"));
  };

  const options: { id: Theme; label: string; icon: "monitor" | "sun" | "moon" }[] = [
    { id: "light", label: "Light", icon: "sun" },
    { id: "system", label: "Auto", icon: "monitor" },
    { id: "dark", label: "Dark", icon: "moon" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs ${className}`}
    >
      {options.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => changeTheme(opt.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium motion-safe:transition cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
              active
                ? "bg-brand text-brand-ink shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-surface-muted"
            }`}
          >
            <Icon name={opt.icon} className="h-3.5 w-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
