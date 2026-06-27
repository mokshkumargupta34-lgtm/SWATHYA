"use client";

import * as React from "react";
import {
  Baby,
  Brain,
  CalendarClock,
  Check,
  ClipboardList,
  HeartPulse,
  Inbox,
  Loader2,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiSend } from "@/lib/client-api";
import { VideoCallOverlay } from "@/components/ui/video-call";
import {
  EmptyState,
  ErrorNote,
  Field,
  languageLabel,
  PageContainer,
  SectionCard,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/app/primitives";

type DoctorConsult = {
  id: string;
  type: "GENERAL" | "SPECIALIST" | "MENTAL" | "MATERNAL";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  scheduled_at: string;
  language: string;
  notes: string | null;
  patient_name: string | null;
  patient_id: string;
  doctor_id: string | null;
  doctor_name: string | null;
  doctor_notes: string | null;
  prescription: string | null;
  mine: boolean;
};

type PatientHealth = {
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_language: string | null;
  chronic_conditions: string[] | null;
  allergies: string | null;
  current_medications: string | null;
  is_pregnant: boolean | null;
};

const TYPE_META: Record<
  DoctorConsult["type"],
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

function ageFrom(dob: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export default function DoctorConsolePage() {
  const [consults, setConsults] = React.useState<DoctorConsult[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [call, setCall] = React.useState<DoctorConsult | null>(null);
  // After a call ends, nudge the doctor to complete that consult (notes + Rx).
  const [completeFor, setCompleteFor] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    apiGet<{ consults: DoctorConsult[] }>("/api/doctor/consults")
      .then((r) => setConsults(r.consults))
      .catch((e) => setError(e.message));
  }, []);

  React.useEffect(load, [load]);

  const apply = (updated: DoctorConsult) =>
    setConsults((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null);

  const open =
    consults?.filter((c) => c.status === "SCHEDULED" && !c.doctor_id) ?? [];
  const mine =
    consults?.filter((c) => c.status === "SCHEDULED" && c.mine) ?? [];
  const done =
    consults?.filter((c) => c.status === "COMPLETED" || c.status === "CANCELLED") ?? [];

  const stats = [
    { icon: Inbox, k: open.length, v: "Open in queue", c: "text-cyan-600 bg-cyan-500/10" },
    { icon: CalendarClock, k: mine.length, v: "Accepted by you", c: "text-emerald-600 bg-emerald-500/10" },
    { icon: Check, k: done.filter((c) => c.status === "COMPLETED").length, v: "Completed", c: "text-teal-600 bg-teal-500/10" },
  ];

  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Consultation queue</h1>
          <p className="text-sm text-muted-foreground">
            Accept patients from the shared queue, then complete with notes &amp; a prescription.
          </p>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {!consults ? (
        <SectionCard>
          <Spinner label="Loading your queue…" />
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.v} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", s.c)}>
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-foreground">{s.k}</p>
                <p className="text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>

          <Section title="Open queue" hint="Unassigned consults in your specialty">
            {open.length === 0 ? (
              <SectionCard>
                <EmptyState icon={Inbox} title="Queue is empty" hint="New bookings in your specialty will appear here." />
              </SectionCard>
            ) : (
              open.map((c) => <ConsultCard key={c.id} consult={c} onChange={apply} onError={setError} onCall={() => setCall(c)} autoComplete={completeFor === c.id} />)
            )}
          </Section>

          {mine.length > 0 ? (
            <Section title="Accepted by you" hint="Complete, reschedule or cancel">
              {mine.map((c) => (
                <ConsultCard key={c.id} consult={c} onChange={apply} onError={setError} onCall={() => setCall(c)} autoComplete={completeFor === c.id} />
              ))}
            </Section>
          ) : null}

          {done.length > 0 ? (
            <Section title="History" hint="Completed & cancelled">
              {done.map((c) => (
                <ConsultCard key={c.id} consult={c} onChange={apply} onError={setError} onCall={() => setCall(c)} autoComplete={completeFor === c.id} />
              ))}
            </Section>
          ) : null}
        </>
      )}

      {call ? (
        <VideoCallOverlay
          room={call.id}
          displayName={call.doctor_name || "Doctor"}
          subject={`${TYPE_META[call.type].label} consultation`}
          waitingFor="patient"
          onClose={() => {
            setCompleteFor(call.id);
            setCall(null);
          }}
        />
      ) : null}
    </PageContainer>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        {hint ? <span className="text-xs text-muted-foreground">· {hint}</span> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ConsultCard({
  consult,
  onChange,
  onError,
  onCall,
  autoComplete,
}: {
  consult: DoctorConsult;
  onChange: (c: DoctorConsult) => void;
  onError: (m: string) => void;
  onCall?: () => void;
  autoComplete?: boolean;
}) {
  const meta = TYPE_META[consult.type];
  const [busy, setBusy] = React.useState<string | null>(null);
  const [completing, setCompleting] = React.useState(false);
  const [doctorNotes, setDoctorNotes] = React.useState("");
  const [prescription, setPrescription] = React.useState("");
  const [showHealth, setShowHealth] = React.useState(false);

  // When a call just ended for this consult, open the completion form.
  React.useEffect(() => {
    if (autoComplete && consult.status === "SCHEDULED") setCompleting(true);
  }, [autoComplete, consult.status]);

  const act = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      const { consult: updated } = await apiSend<{ consult: DoctorConsult }>(
        `/api/doctor/consults/${consult.id}`,
        "PATCH",
        body,
      );
      onChange(updated);
      if (body.action === "complete") setCompleting(false);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const reschedule = async () => {
    const input = window.prompt(
      "New date & time (YYYY-MM-DD HH:MM)",
      new Date(consult.scheduled_at).toISOString().slice(0, 16).replace("T", " "),
    );
    if (!input) return;
    const when = new Date(input.replace(" ", "T"));
    if (Number.isNaN(when.getTime())) {
      onError("Couldn't read that date — use YYYY-MM-DD HH:MM");
      return;
    }
    act({ action: "reschedule", scheduledAt: when.toISOString() }, "reschedule");
  };

  const statusStyle =
    consult.status === "SCHEDULED"
      ? "bg-emerald-500/10 text-emerald-600"
      : consult.status === "CANCELLED"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-muted text-muted-foreground";

  return (
    <SectionCard className="p-5">
      <div className="flex flex-wrap items-start gap-4">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", meta.chip)}>
          <meta.icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{consult.patient_name || "Patient"}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", statusStyle)}>
              {consult.status.charAt(0) + consult.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {meta.label} · {formatWhen(consult.scheduled_at)} · {languageLabel(consult.language)}
          </p>
          {consult.notes ? (
            <p className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Patient note:</span> {consult.notes}
            </p>
          ) : null}

          {/* Completed: show what the doctor recorded */}
          {consult.status === "COMPLETED" ? (
            <div className="mt-2 space-y-1.5 text-sm">
              {consult.doctor_notes ? (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Notes:</span> {consult.doctor_notes}
                </p>
              ) : null}
              {consult.prescription ? (
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-foreground">
                  <span className="font-medium text-emerald-600">Rx:</span> {consult.prescription}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Health profile expander */}
          <button
            onClick={() => setShowHealth((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <UserRound className="h-3.5 w-3.5" />
            {showHealth ? "Hide patient health" : "View patient health"}
          </button>
          {showHealth ? <HealthPanel patientId={consult.patient_id} onError={onError} /> : null}
        </div>
      </div>

      {/* Actions */}
      {consult.status === "SCHEDULED" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {!consult.mine ? (
            <button
              onClick={() => act({ action: "accept" }, "accept")}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {busy === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Accept
            </button>
          ) : (
            <>
              {onCall ? (
                <button
                  onClick={onCall}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-[1.02]"
                >
                  <Video className="h-4 w-4" /> Start video call
                </button>
              ) : null}
              <button
                onClick={() => setCompleting((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <Check className="h-4 w-4" /> {completing ? "Close" : "Complete"}
              </button>
              <button
                onClick={reschedule}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {busy === "reschedule" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reschedule
              </button>
              <button
                onClick={() => act({ action: "cancel" }, "cancel")}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-60"
              >
                {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Cancel
              </button>
            </>
          )}
        </div>
      ) : null}

      {completing && consult.status === "SCHEDULED" ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background/50 p-4">
          {autoComplete ? (
            <p className="text-sm font-medium text-emerald-600">
              Call ended — add your notes &amp; prescription to complete this consult.
            </p>
          ) : null}
          <Field label="Consultation notes">
            <TextArea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Assessment, advice, follow-up…"
            />
          </Field>
          <Field label="Prescription (optional)">
            <TextInput
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="e.g. Paracetamol 500mg — twice daily, 3 days"
            />
          </Field>
          <button
            onClick={() =>
              act(
                { action: "complete", doctorNotes: doctorNotes.trim() || null, prescription: prescription.trim() || null },
                "complete",
              )
            }
            disabled={busy !== null}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy === "complete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Mark completed
          </button>
        </div>
      ) : null}
    </SectionCard>
  );
}

function HealthPanel({
  patientId,
  onError,
}: {
  patientId: string;
  onError: (m: string) => void;
}) {
  const [health, setHealth] = React.useState<PatientHealth | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiGet<{ health: PatientHealth }>(`/api/doctor/patient-health/${patientId}`)
      .then((r) => setHealth(r.health))
      .catch((e) => {
        if (/404|No health profile/i.test(e.message)) setHealth(null);
        else onError(e.message);
      })
      .finally(() => setLoading(false));
  }, [patientId, onError]);

  if (loading)
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading health profile…
      </p>
    );
  if (!health)
    return (
      <p className="mt-2 text-xs text-muted-foreground">This patient hasn&rsquo;t shared a health profile.</p>
    );

  const age = ageFrom(health.date_of_birth);
  const conditions = (health.chronic_conditions ?? []).filter((c) => c && c !== "None");
  const items = [
    age != null ? `${age} yrs` : null,
    health.gender,
    health.blood_group ? `${health.blood_group}` : null,
    health.height_cm && health.weight_kg ? `${health.height_cm}cm · ${health.weight_kg}kg` : null,
    health.is_pregnant ? "Pregnant" : null,
  ].filter(Boolean);

  return (
    <div className="mt-2 rounded-xl border border-border bg-background/60 p-3 text-xs">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-foreground">
        {items.map((it, i) => (
          <span key={i} className="font-medium">{it}</span>
        ))}
      </div>
      {conditions.length > 0 ? (
        <p className="mt-1.5 text-muted-foreground">
          <span className="font-medium text-foreground">Conditions:</span> {conditions.join(", ")}
        </p>
      ) : null}
      {health.allergies ? (
        <p className="mt-1 text-muted-foreground">
          <span className="font-medium text-foreground">Allergies:</span> {health.allergies}
        </p>
      ) : null}
      {health.current_medications ? (
        <p className="mt-1 text-muted-foreground">
          <span className="font-medium text-foreground">Medications:</span> {health.current_medications}
        </p>
      ) : null}
    </div>
  );
}
