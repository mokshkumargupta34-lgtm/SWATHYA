"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dependency-free light/dark toggle. The `.dark` class is applied to <html>
 * (see the no-flash script in app/layout.tsx) and persisted to localStorage.
 * Opt-in: the site stays light until the user chooses dark.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
