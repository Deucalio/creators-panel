"use client";

import React, { useSyncExternalStore, useRef } from "react";
import { Icon } from "@/components/icon";

type Theme = "system" | "light" | "dark";

const THEME_KEY = "partnerloop-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// Storage can throw (blocked site data, some private windows and embedded
// browsers). This renders in the sidebar on every dashboard page, so a throw
// here took the whole page down; fall back to the system theme instead, as the
// inline script in app/layout.tsx already does.
// Held for this page too, so the switch still shows the choice it just made
// when storage refused to keep it.
let pageTheme: string | null = null;

function readTheme(): string | null {
  try {
    return localStorage.getItem(THEME_KEY) ?? pageTheme;
  } catch {
    return pageTheme;
  }
}

function saveTheme(theme: Theme) {
  pageTheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Not remembered across visits, but still applied to this page.
  }
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "system";
  const val = readTheme();
  if (val === "light" || val === "dark" || val === "system") return val;
  return "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const changeTheme = (newTheme: Theme) => {
    saveTheme(newTheme);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      changeTheme(options[nextIndex].id);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs ${className}`}
    >
      {options.map((opt, idx) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => changeTheme(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
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
