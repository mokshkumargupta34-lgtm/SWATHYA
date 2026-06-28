"use client";

import * as React from "react";
import {
  FileHeart,
  FlaskConical,
  Loader2,
  Plus,
  Pill,
  Ruler,
  Sparkles,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiSend, type HealthRecord } from "@/lib/client-api";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB (keeps AI analysis within free-tier limits)

function typeMeta(type: string) {
  return TYPES.find((t) => t.value === type) ?? TYPES[0];
}

export default function RecordsPage() {
  const [records, setRecords] = React.useState<HealthRecord[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState<Set<string>>(new Set());

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

  // Run (or re-run) AI analysis for a record and fold the result back in.
  const analyze = React.useCallback(async (id: string) => {
    setError(null);
    setAnalyzing((s) => new Set(s).add(id));
    try {
      const { record } = await apiSend<{ record: HealthRecord }>(
        `/api/records/${id}/analyze`,
        "POST",
      );
      setRecords((prev) => prev?.map((r) => (r.id === id ? record : r)) ?? null);
    } catch (e) {
      setError((e as Error).message);
      setRecords((prev) =>
        prev?.map((r) => (r.id === id ? { ...r, ai_status: "ERROR" } : r)) ?? null,
      );
    } finally {
      setAnalyzing((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }, []);

  return (
    <PageContainer>
      <PageHeading
        icon={FileHeart}
        title="Health Records"
        subtitle="One portable, secure record that travels with you — with AI insights."
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
            if (rec.file_url) analyze(rec.id); // auto-analyze attachments
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
            hint="Add prescriptions, lab reports, vaccination cards and more — attach a photo or PDF and get an instant AI explanation."
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
          {records.map((r) => (
            <RecordCard
              key={r.id}
              record={r}
              analyzing={analyzing.has(r.id)}
              onAnalyze={() => analyze(r.id)}
              onDelete={() => remove(r.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function RecordCard({
  record: r,
  analyzing,
  onAnalyze,
  onDelete,
}: {
  record: HealthRecord;
  analyzing: boolean;
  onAnalyze: () => void;
  onDelete: () => void;
}) {
  const meta = typeMeta(r.type);
  return (
    <SectionCard className="group p-5">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.c)}>
          <meta.icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-foreground">{r.title}</p>
            <button
              onClick={onDelete}
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
          {r.notes ? <p className="mt-2 text-sm text-muted-foreground">{r.notes}</p> : null}
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

          {r.file_url ? (
            <AIInsight record={r} analyzing={analyzing} onAnalyze={onAnalyze} />
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function AIInsight({
  record: r,
  analyzing,
  onAnalyze,
}: {
  record: HealthRecord;
  analyzing: boolean;
  onAnalyze: () => void;
}) {
  if (analyzing) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing with AI…
      </div>
    );
  }

  if (r.ai_status === "DONE" && r.ai_insight) {
    return (
      <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI insight
          </p>
          <button
            onClick={onAnalyze}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Re-analyze
          </button>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {r.ai_insight}
        </p>
        {r.ai_model ? (
          <p className="mt-2 text-[11px] text-muted-foreground/70">Generated by {r.ai_model}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3">
      {r.ai_status === "ERROR" ? (
        <p className="mb-1.5 text-xs text-rose-600">AI analysis didn&rsquo;t finish.</p>
      ) : null}
      <button
        onClick={onAnalyze}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {r.ai_status === "ERROR" ? "Try again" : "Analyze with AI"}
      </button>
    </div>
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
  const [recordedAt, setRecordedAt] = React.useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    const okType = f.type.startsWith("image/") || f.type === "application/pdf";
    if (!okType) {
      onError("Please choose an image or PDF file.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      onError("That file is too large (max 10 MB).");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      let fileUrl: string | null = null;
      let fileMime: string | null = null;

      if (file) {
        if (!isSupabaseConfigured)
          throw new Error("File uploads need Supabase to be configured.");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in again to upload files.");

        const ext =
          file.name.split(".").pop()?.toLowerCase() ||
          (file.type === "application/pdf" ? "pdf" : "img");
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("records")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) {
          throw new Error(
            /bucket not found/i.test(upErr.message)
              ? "Attachments aren’t enabled yet — run the latest supabase/schema.sql."
              : upErr.message,
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("records").getPublicUrl(path);
        fileUrl = publicUrl;
        fileMime = file.type;
      }

      const { record } = await apiSend<{ record: HealthRecord }>("/api/records", "POST", {
        type,
        title: title.trim(),
        notes: notes.trim() || null,
        fileUrl,
        fileMime,
        recordedAt: new Date(recordedAt).toISOString(),
      });
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
        <Field label="Attach a photo or PDF (optional)">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={onPickFile}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
          />
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            {file
              ? `Selected: ${file.name} — we’ll generate an AI explanation after saving.`
              : "A lab report, prescription or scan. We’ll generate an AI explanation you can share with your doctor."}
          </p>
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? "Saving…" : "Save record"}
        </button>
      </form>
    </SectionCard>
  );
}
