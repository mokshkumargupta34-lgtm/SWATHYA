"use client";

import * as React from "react";
import { Activity, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { apiSend } from "@/lib/client-api";
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

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = React.useState("");
  const [age, setAge] = React.useState("");
  const [sex, setSex] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim().length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { text } = await apiSend<{ text: string }>("/api/ai/symptom-check", "POST", {
        symptoms: symptoms.trim(),
        age: age.trim() || undefined,
        sex: sex || undefined,
        duration: duration.trim() || undefined,
        language,
      });
      setResult(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeading
        icon={Activity}
        title="AI symptom checker"
        subtitle="Describe how you feel and get cautious, plain-language guidance — in your language."
      />

      <div className="flex items-start gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-700 dark:text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This is general information, not a diagnosis. For anything serious or
          worsening, see a doctor or call <strong>112</strong>.
        </p>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <SectionCard>
        <form onSubmit={submit} className="space-y-4">
          <Field label="What are you feeling? Describe your symptoms.">
            <TextArea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Fever and body ache for 2 days, mild cough, no breathing trouble…"
              className="min-h-28"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Age">
              <TextInput value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 24" />
            </Field>
            <Field label="Sex">
              <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">—</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Since when?">
              <TextInput value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 2 days" />
            </Field>
            <Field label="Answer in">
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
            {loading ? "Checking…" : "Check symptoms"}
          </button>
        </form>
      </SectionCard>

      {result ? (
        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">Guidance</h2>
          </div>
          <AIResponse text={result} />
        </SectionCard>
      ) : null}
    </PageContainer>
  );
}
