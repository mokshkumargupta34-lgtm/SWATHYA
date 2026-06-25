"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Github, Loader2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { SPECIALTIES, SPECIALTY_LABELS } from "@/lib/validators";
import { Field, Select, TextInput } from "@/components/app/primitives";

type Msg = { type: "info" | "error"; text: string } | null;

export function DoctorAuth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("redirect") || "/doctor";
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [specialty, setSpecialty] = React.useState<string>(SPECIALTIES[0]);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<Msg>(null);

  // OAuth: pass the doctor intent (+ chosen specialty on signup) through the
  // callback so /auth/callback can set the profile role to "doctor".
  const handleOAuth = async (provider: "google" | "github") => {
    if (!supabase) {
      setMessage({ type: "error", text: "Backend not configured." });
      return;
    }
    setPending(true);
    setMessage(null);
    const query =
      mode === "signup"
        ? `?next=/doctor&doctor=1&specialty=${specialty}`
        : `?next=/doctor`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${query}` },
    });
    if (error) {
      setPending(false);
      setMessage({ type: "error", text: error.message });
    }
    // On success the browser is redirected to the provider.
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage({ type: "error", text: "Backend not configured." });
      return;
    }
    setPending(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setPending(false);
        setMessage({
          type: "error",
          text:
            error.message === "Invalid login credentials"
              ? "Wrong email or password."
              : error.message,
        });
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    // Sign up as a doctor — role + specialty are written to the profile by the
    // handle_new_user trigger from this metadata.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim(), role: "doctor", specialty },
      },
    });
    setPending(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (data.session) {
      router.push("/doctor");
      router.refresh();
    } else {
      setMessage({
        type: "info",
        text: "Doctor account created! Confirm your email, then sign in to your console.",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Doctor Portal
              </p>
              <h1 className="font-heading text-xl font-bold text-foreground">
                {mode === "login" ? "Sign in to your console" : "Join as a doctor"}
              </h1>
            </div>
          </div>

          {mode === "signup" ? (
            <div className="mb-4">
              <Field label="Your specialty">
                <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {SPECIALTY_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <GoogleIcon className="h-4 w-4" /> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <Github className="h-4 w-4" /> Continue with GitHub
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <Field label="Full name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Asha Verma"
                  required
                />
              </Field>
            ) : null}
            <Field label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.org"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </Field>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "login" ? "Sign In" : "Create doctor account"}
            </button>

            {message && (
              <p
                className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  message.type === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary",
                )}
              >
                {message.text}
              </p>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link href="/doctor/signup" className="text-primary underline underline-offset-4">
                  Register as a doctor
                </Link>
              </>
            ) : (
              <>
                Already registered?{" "}
                <Link href="/doctor/login" className="text-primary underline underline-offset-4">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Are you a patient?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Go to the patient login
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </svg>
  );
}
