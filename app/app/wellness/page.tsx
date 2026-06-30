"use client";

import * as React from "react";
import { Brain, Loader2, Phone, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiSend } from "@/lib/client-api";
import {
  ErrorNote,
  LANGUAGE_OPTIONS,
  PageContainer,
  PageHeading,
  Select,
} from "@/components/app/primitives";

type Msg = { role: "user" | "model"; text: string };

const GREETING: Msg = {
  role: "model",
  text: "Hi, I'm Mitra — a calm space to talk. Whatever's on your mind, big or small, I'm here to listen. How are you feeling today?",
};

export default function WellnessPage() {
  const [messages, setMessages] = React.useState<Msg[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const { text: reply } = await apiSend<{ text: string }>("/api/ai/wellness", "POST", {
        messages: next,
        language,
      });
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeading
        icon={Brain}
        title="Mitra — wellness companion"
        subtitle="A private, judgement-free space. Not a therapist — but always here to listen."
        action={
          <div className="w-40">
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <Phone className="h-3.5 w-3.5 text-primary" />
        In crisis? Tele-MANAS <strong className="text-foreground">14416</strong> · iCall{" "}
        <strong className="text-foreground">9152987821</strong> · Emergency{" "}
        <strong className="text-foreground">112</strong>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Mitra is typing…
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what's on your mind…"
          className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
          aria-label="Send"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </PageContainer>
  );
}
