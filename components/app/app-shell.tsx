"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  FileHeart,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: FileHeart, label: "Records", href: "/app/records" },
  { icon: Stethoscope, label: "Consults", href: "/app/consults" },
  { icon: Pill, label: "Medicines", href: "/app/medicines" },
  { icon: Users, label: "Family", href: "/app/family" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

const PLAN_LABEL: Record<string, string> = {
  JAN: "Individual",
  PARIVAR: "Family+",
  SAMUDAY: "Community",
};

export type ShellUser = {
  name: string;
  email: string;
  plan: string;
};

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "A").toUpperCase();

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const signOut = async () => {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/60 p-5 backdrop-blur lg:flex">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
            <HeartPulse className="h-4 w-4" />
          </span>
          <span className="text-lg">Sanjeevani</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(n.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name || user.email}
              </p>
              <p className="text-xs text-primary">
                {PLAN_LABEL[user.plan] ?? "Individual"} plan
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </aside>

      {/* Main column */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
              <HeartPulse className="h-4 w-4" />
            </span>
            <span className="text-base">Sanjeevani</span>
          </Link>
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </p>
            <p className="font-heading text-xl font-semibold text-foreground">
              Care Console
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isSupabaseConfigured && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                Demo
              </span>
            )}
            <LanguageSelector className="border border-border text-muted-foreground hover:text-foreground" />
            <ThemeToggle className="border border-border text-muted-foreground hover:text-foreground" />
            <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>
            <span
              title={user.email}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 font-semibold text-white"
            >
              {initial}
            </span>
          </div>
        </header>

        {/* Mobile tab bar */}
        <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background/80 px-3 py-2 backdrop-blur lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive(n.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>

        {children}
      </div>
    </div>
  );
}
