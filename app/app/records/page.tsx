"use client";

import * as React from "react";
import {
  FileHeart,
  FlaskConical,
  Loader2,
  Plus,
  Pill,
  Ruler,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiSend, type HealthRecord } from "@/lib/client-api";
import {
  EmptyState,
  ErrorNote,
  Field,
  PageContainer,
  PageHeading,
  SectionCard,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/app/primitives";

const TYPES = [
  { value: "GENERAL", label: "General", icon: FileHeart, c: "text-cyan-600 bg-cyan-500/10" },
  { value: "PRESCRIPTION", label: "Prescription", icon: Pill, c: "text-teal-600 bg-teal-500/10" },
  { value: "LAB", label: "Lab report", icon: FlaskConical, c: "text-sky-600 bg-sky-500/10" },
  { value: "VACCINATION", label: "Vaccination", icon: Syringe, c: "text-emerald-600 bg-emerald-500/10" },
  { value: "GROWTH", label: "Growth", icon: Ruler, c: "text-amber-600 bg-amber-500/10" },
] as const;

function typeMeta(type: string) {
  return TYPES.find((t) => t.value === type) ?? TYPES[0];
}

export default function RecordsPage() {
  const [records, setRecords] = React.useState<HealthRecord[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(() => {
    apiGet<{ records: HealthRecord[] }>("/api/records")
      .then((r) => setRecords(r.records))
      .catch((e) => setError(e.message));
  }, []);

  React.useEffect(load, [load]);

  const remove = async (id: string) => {
    setRecords((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await apiSend(`/api/records/${id}`, "DELETE");
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  };

  return (
    <PageContainer>
      <PageHeading
        icon={FileHeart}
        title="Health Records"
        subtitle="One portable, secure record that travels with you."
        action={
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-[#03141a] transition-transform hover:scale-105"
          >
            {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? "Close" : "New record"}
          </button>
        }
      />

      <ErrorNote>{error}</ErrorNote>

      {open ? (
        <RecordForm
          onCreated={(rec) => {
            setRecords((prev) => [rec, ...(prev ?? [])]);
            setOpen(false);
          }}
          onError={setError}
        />
      ) : null}

      {!records ? (
        <SectionCard>
          <Spinner label="Loading records…" />
        </SectionCard>
      ) : records.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={FileHeart}
            title="No records yet"
            hint="Add prescriptions, lab reports, vaccination cards and more."
            action={
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Add your first record
              </button>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {records.map((r) => {
            const meta = typeMeta(r.type);
            return (
              <SectionCard key={r.id} className="group p-5">
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.c)}>
                    <meta.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{r.title}</p>
                      <button
                        onClick={() => remove(r.id)}
                        aria-label="Delete record"
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} ·{" "}
                      {new Date(r.recorded_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {r.notes ? (
                      <p className="mt-2 text-sm text-muted-foreground">{r.notes}</p>
                    ) : null}
                    {r.file_url ? (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-medium text-primary underline underline-offset-2"
                      >
                        View attachment
                      </a>
                    ) : null}
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

function RecordForm({
  onCreated,
  onError,
}: {
  onCreated: (rec: HealthRecord) => void;
  onError: (msg: string) => void;
}) {
  const [type, setType] = React.useState("GENERAL");
  const [title, setTitle] = React.useState("");
  const [recordedAt, setRecordedAt] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { record } = await apiSend<{ record: HealthRecord }>(
        "/api/records",
        "POST",
        {
          type,
          title: title.trim(),
          notes: notes.trim() || null,
          recordedAt: new Date(recordedAt).toISOString(),
        },
      );
      onCreated(record);
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
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blood test — June"
              required
            />
          </Field>
          <Field label="Date">
            <TextInput
              type="date"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering about this record…"
          />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Save record
        </button>
      </form>
    </SectionCard>
  );
}
