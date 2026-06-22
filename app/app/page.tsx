"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Baby,
  Brain,
  CalendarClock,
  CalendarPlus,
  FilePlus2,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiGet, type Consult } from "@/lib/client-api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HealthProfileCard } from "@/components/dashboard/health-profile-card";
import {
  EmptyState,
  PageContainer,
  SectionCard,
  Spinner,
} from "@/components/app/primitives";

type DashboardData = {
  stats: {
    upcomingConsults: number;
    recordsCount: number;
    remindersDue: number;
    villagesLive: number;
  };
  weekly: number[];
  labels: string[];
  queue: Consult[];
};

const CONSULT_META: Record<
  Consult["type"],
  { icon: React.ElementType; label: string; chip: string }
> = {
  GENERAL: { icon: Stethoscope, label: "General physician", chip: "text-cyan-600 bg-cyan-500/10" },
  SPECIALIST: { icon: HeartPulse, label: "Specialist", chip: "text-teal-600 bg-teal-500/10" },
  MENTAL: { icon: Brain, label: "Mental health", chip: "text-sky-600 bg-sky-500/10" },
  MATERNAL: { icon: Baby, label: "Maternal & child", chip: "text-emerald-600 bg-emerald-500/10" },
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiGet<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const stats = data
    ? [
        { icon: CalendarClock, k: data.stats.upcomingConsults, v: "Upcoming consults", c: "text-cyan-600 bg-cyan-500/10" },
        { icon: HeartPulse, k: data.stats.recordsCount, v: "Records on file", c: "text-emerald-600 bg-emerald-500/10" },
        { icon: Activity, k: data.stats.remindersDue, v: "Reminders due", c: "text-teal-600 bg-teal-500/10" },
        { icon: ShieldCheck, k: "Encrypted", v: "Records protected", c: "text-sky-600 bg-sky-500/10" },
      ]
    : [];

  const maxBar = data ? Math.max(1, ...data.weekly) : 1;

  return (
    <PageContainer>
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data
          ? stats.map((s, i) => (
              <motion.div
                key={s.v}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", s.c)}>
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground">{s.k}</p>
                <p className="text-xs text-muted-foreground">{s.v}</p>
              </motion.div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
      </div>

      {error ? (
        <SectionCard>
          <p className="text-sm text-muted-foreground">
            {!isSupabaseConfigured
              ? "You’re exploring SWASTHYA in demo mode. Sign in to see your live consultations, records and reminders."
              : "We couldn’t load your console data just now. Please refresh or try again shortly."}
          </p>
        </SectionCard>
      ) : null}

      {/* Personal health profile (reflects onboarding answers) */}
      <HealthProfileCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly chart */}
        <SectionCard className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Weekly consultations
            </h2>
          </div>
          {!data ? (
            <Spinner />
          ) : (
            <div className="flex h-48 items-end gap-2">
              {data.weekly.map((h, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-cyan-500/40 to-emerald-400 transition-all hover:from-cyan-500/70"
                      style={{ height: `${Math.max(4, (h / maxBar) * 100)}%` }}
                      title={`${h} consult${h === 1 ? "" : "s"}`}
                    />
                  </div>
                  <span className="mt-2 text-[10px] text-muted-foreground">
                    {data.labels[i]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Care queue */}
        <SectionCard>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Care queue
            </h2>
          </div>
          {!data ? (
            <Spinner />
          ) : data.queue.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming care"
              hint="Book a tele-consult to get started."
              action={
                <Link
                  href="/app/consults"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
                >
                  <CalendarPlus className="h-4 w-4" /> Book a consult
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {data.queue.map((c) => {
                const meta = CONSULT_META[c.type];
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", meta.chip)}>
                      <meta.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{formatWhen(c.scheduled_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/records"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            <FilePlus2 className="h-4 w-4" /> Add a record
          </Link>
          <Link
            href="/app/consults"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <CalendarPlus className="h-4 w-4" /> Book a consult
          </Link>
          <Link
            href="/app/medicines"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Users className="h-4 w-4" /> Find medicine
          </Link>
        </div>
      </SectionCard>

      <p className="pb-8 pt-2 text-center text-xs text-muted-foreground">
        SWASTHYA · स्वास्थ्य — bringing healthcare closer in distance, cost and language.
      </p>
    </PageContainer>
  );
}
