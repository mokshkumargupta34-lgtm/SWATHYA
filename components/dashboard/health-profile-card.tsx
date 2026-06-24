"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  CalendarHeart,
  Droplet,
  Languages,
  Loader2,
  MapPin,
  Phone,
  Pill,
  ShieldAlert,
  SquarePen,
  Baby,
  HeartPulse,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { readLocalHealth } from "@/lib/health-local";

interface Health {
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  phone: string | null;
  location: string | null;
  preferred_language: string | null;
  chronic_conditions: string[] | null;
  allergies: string | null;
  current_medications: string | null;
  is_pregnant: boolean | null;
  stress_level: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

function ageFrom(dob: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function bmiFrom(h: number | null, w: number | null) {
  if (!h || !w) return null;
  const m = h / 100;
  const v = w / (m * m);
  const cat =
    v < 18.5 ? "Underweight" : v < 25 ? "Normal" : v < 30 ? "Overweight" : "Obese";
  return { value: v.toFixed(1), cat };
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 font-mono text-lg font-bold tracking-tight text-foreground">{value ?? "—"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function HealthProfileCard() {
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [h, setH] = React.useState<Health | null>(null);

  React.useEffect(() => {
    let active = true;
    if (!supabase) {
      // Mock mode: reflect whatever onboarding stored locally.
      setH(readLocalHealth());
      setLoading(false);
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setH((data as Health) ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const age = ageFrom(h?.date_of_birth ?? null);
  const bmi = bmiFrom(h?.height_cm ?? null, h?.weight_kg ?? null);
  const conditions = (h?.chronic_conditions ?? []).filter((c) => c && c !== "None");
  const hasData =
    !!h &&
    Object.entries(h).some(
      ([k, v]) =>
        k !== "is_pregnant" &&
        v != null &&
        !(Array.isArray(v) && v.length === 0) &&
        v !== "",
    );

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HeartPulse className="h-5 w-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Your health profile
          </h2>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <SquarePen className="h-4 w-4" /> Edit
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&rsquo;t set up your health profile yet. Add your details so
            we can personalize care, reminders and medicine.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
          >
            Complete your health profile
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={CalendarHeart} label="Age" value={age != null ? `${age} yrs` : "—"} />
            <Stat icon={Activity} label="Gender" value={h?.gender} />
            <Stat icon={Droplet} label="Blood group" value={h?.blood_group} />
            <Stat
              icon={Activity}
              label={bmi ? `BMI · ${bmi.cat}` : "BMI"}
              value={bmi?.value}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info icon={Languages} label="Preferred language" value={h?.preferred_language} />
            <Info icon={MapPin} label="Location" value={h?.location} />
            <Info icon={ShieldAlert} label="Allergies" value={h?.allergies} />
            <Info icon={Pill} label="Medications" value={h?.current_medications} />
            <Info
              icon={Phone}
              label="Emergency contact"
              value={
                h?.emergency_contact_name || h?.emergency_contact_phone
                  ? `${h?.emergency_contact_name ?? ""} ${
                      h?.emergency_contact_phone ? `· ${h.emergency_contact_phone}` : ""
                    }`.trim()
                  : null
              }
            />
            {h?.is_pregnant ? (
              <Info icon={Baby} label="Maternal" value="Currently pregnant" />
            ) : null}
          </div>

          {conditions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ongoing conditions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {conditions.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}
