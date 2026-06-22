"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Loader2, LogOut, Settings, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiSend } from "@/lib/client-api";
import { useLiteMode, setLiteMode } from "@/hooks/use-lite-mode";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { ProfileCard } from "@/components/dashboard/profile-card";
import {
  ErrorNote,
  Field,
  LANGUAGE_OPTIONS,
  PageContainer,
  PageHeading,
  SectionCard,
  Select,
  Spinner,
} from "@/components/app/primitives";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  language: string;
};

const PLANS = [
  { value: "JAN", label: "Individual (JAN)", price: "Free", desc: "For individuals & families" },
  { value: "PARIVAR", label: "Family+ (PARIVAR)", price: "₹99/mo", desc: "Up to 6 members, specialists" },
  { value: "SAMUDAY", label: "Community (SAMUDAY)", price: "₹499/mo", desc: "For NGOs, clinics & programs" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [savingLang, setSavingLang] = React.useState(false);
  const [langSaved, setLangSaved] = React.useState(false);
  const [planBusy, setPlanBusy] = React.useState<string | null>(null);
  const lite = useLiteMode();

  React.useEffect(() => {
    apiGet<{ profile: Profile }>("/api/profile")
      .then((r) => setProfile(r.profile))
      .catch((e) => setError(e.message));
  }, []);

  const saveLanguage = async (language: string) => {
    setProfile((p) => (p ? { ...p, language } : p));
    setSavingLang(true);
    setLangSaved(false);
    try {
      await apiSend("/api/profile", "PATCH", { language });
      setLangSaved(true);
      setTimeout(() => setLangSaved(false), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingLang(false);
    }
  };

  const changePlan = async (plan: string) => {
    setPlanBusy(plan);
    try {
      const { profile: updated } = await apiSend<{ profile: Profile }>(
        "/api/profile/plan",
        "PATCH",
        { plan },
      );
      setProfile(updated);
      router.refresh(); // refresh the sidebar plan badge
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPlanBusy(null);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <PageContainer>
      <PageHeading
        icon={Settings}
        title="Settings"
        subtitle="Profile, language and your plan."
      />

      <ErrorNote>{error}</ErrorNote>

      {/* Profile (name + avatar) — reuses the existing Supabase-backed card */}
      <SectionCard>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">Your profile</h2>
        </div>
        <ProfileCard />
      </SectionCard>

      {/* Preferred language */}
      <SectionCard>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Preferred language
          </h2>
        </div>
        {!profile ? (
          <Spinner />
        ) : (
          <div className="flex max-w-md items-end gap-3">
            <div className="flex-1">
              <Field label="Care & consults will default to this language">
                <Select
                  value={profile.language}
                  onChange={(e) => saveLanguage(e.target.value)}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <span className="flex h-10 items-center text-sm text-emerald-600">
              {savingLang ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : langSaved ? (
                <Check className="h-4 w-4" />
              ) : null}
            </span>
          </div>
        )}
      </SectionCard>

      {/* Plan */}
      <SectionCard>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">Your plan</h2>
        </div>
        {!profile ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PLANS.map((p) => {
              const active = profile.plan === p.value;
              return (
                <div
                  key={p.value}
                  className={cn(
                    "rounded-2xl border p-4 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border bg-background/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{p.label}</p>
                    {active ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-heading text-xl font-bold text-foreground">{p.price}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                  {!active ? (
                    <button
                      onClick={() => changePlan(p.value)}
                      disabled={planBusy !== null}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
                    >
                      {planBusy === p.value ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Switch to this plan
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Lite mode — low-bandwidth data saver */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">Lite mode (data saver)</p>
              <p className="text-sm text-muted-foreground">
                Skip heavy animations and 3-D graphics for faster loads on slow
                connections.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={lite}
            aria-label="Toggle lite mode"
            onClick={() => setLiteMode(!lite)}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
              lite ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                lite ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
      </SectionCard>

      {/* Sign out */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">Sign out</p>
            <p className="text-sm text-muted-foreground">
              End your session on this device.
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
