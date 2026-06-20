"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const LANGUAGES = [
  "English",
  "हिन्दी (Hindi)",
  "বাংলা (Bengali)",
  "தமிழ் (Tamil)",
  "తెలుగు (Telugu)",
  "मराठी (Marathi)",
  "ਪੰਜਾਬੀ (Punjabi)",
  "Other",
];
const CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart disease",
  "Thyroid",
  "Tuberculosis",
  "None",
];

const fieldCls =
  "mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

interface HealthState {
  date_of_birth: string;
  gender: string;
  blood_group: string;
  height_cm: string;
  weight_kg: string;
  phone: string;
  location: string;
  preferred_language: string;
  chronic_conditions: string[];
  allergies: string;
  current_medications: string;
  is_pregnant: boolean;
  stress_level: number | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}

const EMPTY: HealthState = {
  date_of_birth: "",
  gender: "",
  blood_group: "",
  height_cm: "",
  weight_kg: "",
  phone: "",
  location: "",
  preferred_language: "",
  chronic_conditions: [],
  allergies: "",
  current_medications: "",
  is_pregnant: false,
  stress_level: null,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

export function HealthOnboarding() {
  const router = useRouter();
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [s, setS] = React.useState<HealthState>(EMPTY);

  const set = <K extends keyof HealthState>(k: K, v: HealthState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  React.useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setS({
          date_of_birth: data.date_of_birth ?? "",
          gender: data.gender ?? "",
          blood_group: data.blood_group ?? "",
          height_cm: data.height_cm?.toString() ?? "",
          weight_kg: data.weight_kg?.toString() ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          preferred_language: data.preferred_language ?? "",
          chronic_conditions: data.chronic_conditions ?? [],
          allergies: data.allergies ?? "",
          current_medications: data.current_medications ?? "",
          is_pregnant: data.is_pregnant ?? false,
          stress_level: data.stress_level ?? null,
          emergency_contact_name: data.emergency_contact_name ?? "",
          emergency_contact_phone: data.emergency_contact_phone ?? "",
          notes: data.notes ?? "",
        });
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const toggleCondition = (c: string) => {
    setS((prev) => {
      if (c === "None") return { ...prev, chronic_conditions: ["None"] };
      const without = prev.chronic_conditions.filter((x) => x !== "None");
      return {
        ...prev,
        chronic_conditions: without.includes(c)
          ? without.filter((x) => x !== c)
          : [...without, c],
      };
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) {
      router.push("/dashboard");
      return;
    }
    setSaving(true);
    setNotice(null);
    const payload = {
      id: userId,
      date_of_birth: s.date_of_birth || null,
      gender: s.gender || null,
      blood_group: s.blood_group || null,
      height_cm: s.height_cm ? Number(s.height_cm) : null,
      weight_kg: s.weight_kg ? Number(s.weight_kg) : null,
      phone: s.phone || null,
      location: s.location || null,
      preferred_language: s.preferred_language || null,
      chronic_conditions: s.chronic_conditions,
      allergies: s.allergies || null,
      current_medications: s.current_medications || null,
      is_pregnant: s.is_pregnant,
      stress_level: s.stress_level,
      emergency_contact_name: s.emergency_contact_name || null,
      emergency_contact_phone: s.emergency_contact_phone || null,
      notes: s.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("health_profiles").upsert(payload);
    setSaving(false);
    if (error) {
      setNotice(
        /relation .*health_profiles.* does not exist|schema cache|could not find the table/i.test(
          error.message,
        )
          ? "Run supabase/schema.sql in your Supabase SQL editor to create the health_profiles table."
          : error.message,
      );
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 py-12">
      <form
        onSubmit={save}
        className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10"
      >
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartPulse className="h-6 w-6" />
          </span>
          <h1 className="font-heading mt-4 text-2xl font-bold">
            Set up your health profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This helps us tailor care, reminders and medicine to you. You can edit
            it anytime.
          </p>
        </div>

        {/* About you */}
        <fieldset className="space-y-4">
          <legend className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            About you
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm">Date of birth</Label>
              <input
                type="date"
                value={s.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
                className={fieldCls}
              />
            </div>
            <div>
              <Label className="text-sm">Gender</Label>
              <select
                value={s.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={fieldCls}
              >
                <option value="">Select…</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Preferred language</Label>
              <select
                value={s.preferred_language}
                onChange={(e) => set("preferred_language", e.target.value)}
                className={fieldCls}
              >
                <option value="">Select…</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Phone</Label>
              <Input
                type="tel"
                value={s.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91…"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm">Village / town / city</Label>
              <Input
                value={s.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Where can care reach you?"
              />
            </div>
          </div>
        </fieldset>

        {/* Vitals */}
        <fieldset className="mt-8 space-y-4">
          <legend className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            Vitals
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-sm">Blood group</Label>
              <select
                value={s.blood_group}
                onChange={(e) => set("blood_group", e.target.value)}
                className={fieldCls}
              >
                <option value="">Select…</option>
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Height (cm)</Label>
              <Input
                type="number"
                value={s.height_cm}
                onChange={(e) => set("height_cm", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">Weight (kg)</Label>
              <Input
                type="number"
                value={s.weight_kg}
                onChange={(e) => set("weight_kg", e.target.value)}
              />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.is_pregnant}
              onChange={(e) => set("is_pregnant", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            I am currently pregnant
          </label>
        </fieldset>

        {/* Conditions */}
        <fieldset className="mt-8 space-y-4">
          <legend className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            Conditions & medicines
          </legend>
          <div>
            <Label className="text-sm">Ongoing conditions</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONDITIONS.map((c) => {
                const active = s.chronic_conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-sm">Allergies</Label>
            <Input
              value={s.allergies}
              onChange={(e) => set("allergies", e.target.value)}
              placeholder="e.g. penicillin, peanuts"
            />
          </div>
          <div>
            <Label className="text-sm">Current medications</Label>
            <textarea
              value={s.current_medications}
              onChange={(e) => set("current_medications", e.target.value)}
              rows={2}
              placeholder="List any medicines you take regularly"
              className={cn(fieldCls, "h-auto")}
            />
          </div>
        </fieldset>

        {/* Wellbeing */}
        <fieldset className="mt-8 space-y-3">
          <legend className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            Wellbeing
          </legend>
          <Label className="text-sm">How stressed have you felt lately?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("stress_level", n)}
                className={cn(
                  "h-10 flex-1 cursor-pointer rounded-lg border text-sm font-medium transition-colors",
                  s.stress_level === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">1 = calm · 5 = very stressed</p>
        </fieldset>

        {/* Emergency */}
        <fieldset className="mt-8 space-y-4">
          <legend className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
            Emergency contact
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm">Name</Label>
              <Input
                value={s.emergency_contact_name}
                onChange={(e) => set("emergency_contact_name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">Phone</Label>
              <Input
                type="tel"
                value={s.emergency_contact_phone}
                onChange={(e) => set("emergency_contact_phone", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm">Anything else we should know?</Label>
            <textarea
              value={s.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className={cn(fieldCls, "h-auto")}
            />
          </div>
        </fieldset>

        {notice && (
          <p className="mt-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {notice}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
          <Button type="submit" size="lg" className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save &amp; continue
          </Button>
        </div>
      </form>
    </section>
  );
}
