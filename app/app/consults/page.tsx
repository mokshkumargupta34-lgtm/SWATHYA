"use client";

import * as React from "react";
import {
  Baby,
  Brain,
  CalendarClock,
  HeartPulse,
  Loader2,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiSend, type Consult } from "@/lib/client-api";
import {
  EmptyState,
  ErrorNote,
  Field,
  LANGUAGE_OPTIONS,
  languageLabel,
  PageContainer,
  PageHeading,
  SectionCard,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/app/primitives";

const TYPES = [
  { value: "GENERAL", label: "General physician", icon: Stethoscope, c: "text-cyan-600 bg-cyan-500/10" },
  { value: "SPECIALIST", label: "Specialist", icon: HeartPulse, c: "text-teal-600 bg-teal-500/10" },
  { value: "MENTAL", label: "Mental health", icon: Brain, c: "text-sky-600 bg-sky-500/10" },
  { value: "MATERNAL", label: "Maternal & child", icon: Baby, c: "text-emerald-600 bg-emerald-500/10" },
] as const;

function typeMeta(type: string) {
  return TYPES.find((t) => t.value === type) ?? TYPES[0];
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConsultsPage() {
  const [consults, setConsults] = React.useState<Consult[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(() => {
    apiGet<{ consults: Consult[] }>("/api/consults")
      .then((r) => setConsults(r.consults))
      .catch((e) => setError(e.message));
  }, []);

  React.useEffect(load, [load]);

  const cancel = async (id: string) => {
    try {
      const { consult } = await apiSend<{ consult: Consult }>(
        `/api/consults/${id}`,
        "PATCH",
        { status: "CANCELLED" },
      );
      setConsults((prev) => prev?.map((c) => (c.id === id ? consult : c)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const now = Date.now();
  const upcoming =
    consults?.filter(
      (c) => c.status === "SCHEDULED" && new Date(c.scheduled_at).getTime() >= now,
    ) ?? [];
  const past =
    consults?.filter(
      (c) => c.status !== "SCHEDULED" || new Date(c.scheduled_at).getTime() < now,
    ) ?? [];

  return (
    <PageContainer>
      <PageHeading
        icon={Stethoscope}
        title="Tele-consultations"
        subtitle="See a doctor in your language — from anywhere."
        action={
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
          >
            {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? "Close" : "Book consult"}
          </button>
        }
      />

      <ErrorNote>{error}</ErrorNote>

      {open ? (
        <ConsultForm
          onBooked={(c) => {
            setConsults((prev) => [...(prev ?? []), c]);
            setOpen(false);
          }}
          onError={setError}
        />
      ) : null}

      {!consults ? (
        <SectionCard>
          <Spinner label="Loading consults…" />
        </SectionCard>
      ) : (
        <>
          <div>
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <SectionCard>
                <EmptyState
                  icon={CalendarClock}
                  title="No upcoming consults"
                  hint="Book a tele-consult with a doctor, specialist or counsellor."
                  action={
                    <button
                      onClick={() => setOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4" /> Book a consult
                    </button>
                  }
                />
              </SectionCard>
            ) : (
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <ConsultRow key={c.id} consult={c} onCancel={() => cancel(c.id)} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 ? (
            <div>
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Past & cancelled
              </h2>
              <div className="space-y-3">
                {past.map((c) => (
                  <ConsultRow key={c.id} consult={c} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}

function ConsultRow({
  consult,
  onCancel,
}: {
  consult: Consult;
  onCancel?: () => void;
}) {
  const meta = typeMeta(consult.type);
  const statusStyle =
    consult.status === "SCHEDULED"
      ? "bg-emerald-500/10 text-emerald-600"
      : consult.status === "CANCELLED"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-muted text-muted-foreground";
  return (
    <SectionCard className="flex flex-wrap items-center gap-4 p-5">
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", meta.c)}>
        <meta.icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{meta.label}</p>
        <p className="text-xs text-muted-foreground">
          {formatWhen(consult.scheduled_at)} · {languageLabel(consult.language)}
          {consult.doctor_name ? ` · ${consult.doctor_name}` : ""}
        </p>
        {consult.notes ? (
          <p className="mt-1 text-sm text-muted-foreground">{consult.notes}</p>
        ) : null}
      </div>
      <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusStyle)}>
        {consult.status.charAt(0) + consult.status.slice(1).toLowerCase()}
      </span>
      {onCancel ? (
        <button
          onClick={onCancel}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
        >
          Cancel
        </button>
      ) : null}
    </SectionCard>
  );
}

function ConsultForm({
  onBooked,
  onError,
}: {
  onBooked: (c: Consult) => void;
  onError: (msg: string) => void;
}) {
  const [type, setType] = React.useState("GENERAL");
  const [language, setLanguage] = React.useState("en");
  const defaultWhen = React.useMemo(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    d.setMinutes(0, 0, 0);
    // Format for datetime-local (local time, no seconds / tz).
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);
  const [when, setWhen] = React.useState(defaultWhen);
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!when) return;
    setSaving(true);
    try {
      const { consult } = await apiSend<{ consult: Consult }>(
        "/api/consults",
        "POST",
        {
          type,
          language,
          scheduledAt: new Date(when).toISOString(),
          notes: notes.trim() || null,
        },
      );
      onBooked(consult);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Consult type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Preferred date & time">
            <TextInput
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </Field>
          <Field label="Language">
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Symptoms, concerns or who the consult is for…"
          />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Book consult
        </button>
      </form>
    </SectionCard>
  );
}
