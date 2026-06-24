"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLiteMode, setLiteMode } from "@/hooks/use-lite-mode";

const LINKS = [
  { label: "Focus", href: "#focus" },
  { label: "Platform", href: "#platform" },
  { label: "Plans", href: "/pricing" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const lite = useLiteMode();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape for keyboard users.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 md:px-6",
          scrolled
            ? "border-white/15 bg-[#04141d]/70 text-white shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-white/10 bg-white/5 text-white backdrop-blur-md",
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
            <HeartPulse className="h-4 w-4" />
          </span>
          <span className="text-lg">SWASTHYA</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="text-white/90 hover:bg-white/10" />
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/join"
            className="cursor-pointer rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
          >
            Get started
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute inset-x-4 top-[72px] z-50 rounded-3xl border border-white/15 bg-[#04141d]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
            <button
              type="button"
              role="switch"
              aria-checked={lite}
              onClick={() => setLiteMode(!lite)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span>Lite mode (data saver)</span>
              <span
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  lite ? "bg-emerald-400" : "bg-white/20",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    lite ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
