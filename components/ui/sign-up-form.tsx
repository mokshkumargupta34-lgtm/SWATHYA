"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SignUpProvider = "google" | "github";

export interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignUpFormProps {
  onSubmit?: (values: SignUpValues) => void;
  onProvider?: (provider: SignUpProvider) => void;
  pending?: boolean;
  message?: { type: "info" | "error"; text: string } | null;
}

export function SignUpForm({
  onSubmit,
  onProvider,
  pending = false,
  message,
}: SignUpFormProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onSubmit?.({ firstName, lastName, email, password });
  };

  return (
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-24">
      <form
        onSubmit={submit}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-white">
                <HeartPulse className="h-5 w-5" />
              </span>
            </Link>
            <h1 className="font-heading mb-1 mt-4 text-xl font-semibold">
              Create your SwasthyaSetu account
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome! A few details and your care travels with you.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">
                  First name
                </Label>
                <Input
                  type="text"
                  required
                  name="firstname"
                  id="firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">
                  Last name
                </Label>
                <Input
                  type="text"
                  name="lastname"
                  id="lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pwd" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                required
                minLength={6}
                name="pwd"
                id="pwd"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
              />
              <p className="text-muted-foreground text-xs">At least 6 characters.</p>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={pending}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary underline underline-offset-4"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <Button className="w-full gap-2" disabled={pending || !agreed}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Account
            </Button>

            {message && (
              <p
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  message.type === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary",
                )}
              >
                {message.text}
              </p>
            )}
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">Or continue with</span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onProvider?.("google")}
              className="flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
                <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
                <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
                <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
                <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
              </svg>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onProvider?.("github")}
              className="flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.957-.266 1.983-.399 3.003-.404c1.02.005 2.047.138 3.006.404c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub</span>
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
