"use client";

import * as React from "react";
import { Check, FileText, Loader2, Save, Sparkles } from "lucide-react";
import { apiSend, type HealthRecord } from "@/lib/client-api";
import {
  AIResponse,
  ErrorNote,
  Field,
  LANGUAGE_OPTIONS,
  PageContainer,
  PageHeading,
  SectionCard,
  Select,
  TextArea,
  TextInput,
} from "@/components/app/primitives";

const QUESTIONS = [
  { key: "Age & sex", placeholder: "e.g. 32, male", area: false },
  { key: "Blood group", placeholder: "e.g. O+ (if you know)", area: false },
  { key: "Ongoing conditions & allergies", placeholder: "e.g. mild asthma; allergic to penicillin", area: true },
  { key: "Past illnesses, surgeries or hospital stays", placeholder: "e.g. typhoid 2019; appendix surgery 2021", area: true },
  { key: "Medicines you take now", placeholder: "e.g. inhaler when needed", area: true },
  { key: "Family history", placeholder: "e.g. father has diabetes", area: true },
  { key: "Lifestyle (work, smoking, alcohol)", placeholder: "e.g. construction worker, no smoking", area: true },
];

export default function HealthHistoryPage() {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [language, setLanguage] = React.useState("en");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  const build = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    setSaved(false);
    try {
      const { text } = await apiSend<{ text: string }>("/api/ai/health-history", "POST", {
        answers,
        language,
      });
      setSummary(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      await apiSend<{ record: HealthRecord }>("/api/records", "POST", {
        type: "GENERAL",
        title: "My health history (AI-assisted)",
        notes: summary,
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeading
        icon={FileText}
        title="AI health-history builder"
        subtitle="Never had written records? Answer a few questions and we'll draft a clean summary to carry with you."
      />

      <ErrorNote>{error}</ErrorNote>

      <SectionCard>
        <form onSubmit={build} className="space-y-4">
          {QUESTIONS.map((q) => (
            <Field key={q.key} label={q.key}>
              {q.area ? (
                <TextArea
                  value={answers[q.key] ?? ""}
                  onChange={(e) => set(q.key, e.target.value)}
                  placeholder={q.placeholder}
                />
              ) : (
                <TextInput
                  value={answers[q.key] ?? ""}
                  onChange={(e) => set(q.key, e.target.value)}
                  placeholder={q.placeholder}
                />
              )}
            </Field>
          ))}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44">
              <Field label="Write summary in">
                <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Building…" : "Build my history"}
            </button>
          </div>
        </form>
      </SectionCard>

      {summary ? (
        <SectionCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="font-heading text-lg font-semibold text-foreground">Your summary</h2>
            </div>
            <button
              onClick={save}
              disabled={saving || saved}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {saved ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved to records" : "Save to my records"}
            </button>
          </div>
          <AIResponse text={summary} />
        </SectionCard>
      ) : null}
    </PageContainer>
  );
}
