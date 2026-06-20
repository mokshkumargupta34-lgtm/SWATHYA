"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Focus", href: "#focus" },
  { label: "Platform", href: "#platform" },
  { label: "Plans", href: "/pricing" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="cursor-pointer rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
