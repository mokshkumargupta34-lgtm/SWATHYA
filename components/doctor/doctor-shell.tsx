"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, LogOut, Stethoscope } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { SPECIALTY_LABELS } from "@/lib/validators";

export type DoctorInfo = { name: string; email: string; specialty: string | null };

export function DoctorShell({
  doctor,
  children,
}: {
  doctor: DoctorInfo;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initial = (doctor.name?.[0] ?? doctor.email?.[0] ?? "D").toUpperCase();
  const specialtyLabel =
    doctor.specialty && doctor.specialty in SPECIALTY_LABELS
      ? SPECIALTY_LABELS[doctor.specialty as keyof typeof SPECIALTY_LABELS]
      : "Doctor";

  const signOut = async () => {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
              <HeartPulse className="h-4 w-4" />
            </span>
            <span className="text-base">
              SWASTHYA <span className="text-muted-foreground">· Doctor</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
              <Stethoscope className="h-3.5 w-3.5" /> {specialtyLabel}
            </span>
            <span className="text-right text-sm">
              <span className="block font-medium leading-tight text-foreground">
                {doctor.name || doctor.email}
              </span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 font-semibold text-white">
              {initial}
            </span>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
