"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Languages widely spoken across India (+ English). Codes match Google Translate.
export const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ml", label: "മലയാളം" },
  { code: "ur", label: "اردو" },
] as const;

const INCLUDED = LANGS.map((l) => l.code).join(",");

type GoogleTranslate = {
  translate?: {
    TranslateElement: new (
      opts: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
      el: string,
    ) => void;
  };
};

declare global {
  interface Window {
    google?: GoogleTranslate;
    googleTranslateElementInit?: () => void;
  }
}

function getCurrentLang(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/googtrans=\/[a-z]+\/([a-z-]+)/i);
  return m ? m[1] : "en";
}

function applyLanguage(code: string) {
  const value = `/en/${code}`;
  document.cookie = `googtrans=${value};path=/`;
  const host = window.location.hostname;
  if (host.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=.${host}`;
  }
  // Google's widget reads the cookie on load, so a reload applies it everywhere.
  window.location.reload();
}

/**
 * Loads the Google Website Translator once and holds its (hidden) mount point.
 * Rendered globally in the root layout so the chosen language (stored in the
 * googtrans cookie) is re-applied on every page load.
 */
export function GoogleTranslateInit() {
  React.useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      const translate = window.google?.translate;
      if (!translate) return;
      new translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: INCLUDED, autoDisplay: false },
        "google_translate_element",
      );
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" aria-hidden className="hidden" />;
}

/**
 * On-brand language dropdown. `className` styles the trigger so it can sit in
 * the dark marketing nav or the light app/doctor headers.
 */
export function LanguageSelector({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState("en");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setLang(getCurrentLang()), []);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="notranslate relative" translate="no">
      <button
        type="button"
        aria-label="Choose language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
          className,
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-72 w-44 overflow-auto rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setOpen(false);
                if (l.code !== lang) applyLanguage(l.code);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                l.code === lang ? "font-semibold text-primary" : "text-foreground",
              )}
            >
              {l.label}
              {l.code === lang ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
