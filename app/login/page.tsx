"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AuthPage,
  type AuthMessage,
  type AuthProvider,
} from "@/components/ui/auth-page";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const PHASES = [
  { at: 0, label: "signing in" },
  { at: 30, label: "loading records" },
  { at: 65, label: "preparing care" },
  { at: 100, label: "welcome" },
];

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Browser Supabase client (null when the project isn't configured yet).
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );

  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<AuthMessage | null>(null);

  // Mock-mode flux loader (only used when Supabase isn't configured).
  const [authenticating, setAuthenticating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (searchParams.get("error")) {
      setMessage({ type: "error", text: "Sign-in failed — please try again." });
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!authenticating) return;
    setProgress(0);
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 70);
    return () => clearInterval(id);
  }, [authenticating]);

  const callbackUrl = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const handleProvider = async (provider: AuthProvider) => {
    if (!supabase) {
      setAuthenticating(true);
      return;
    }
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl(redirectTo) },
    });
    if (error) {
      setPending(false);
      setMessage({ type: "error", text: error.message });
    }
    // On success the browser is redirected to the provider.
  };

  const handleEmail = async (email: string) => {
    if (!supabase) {
      setAuthenticating(true);
      return;
    }
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(redirectTo) },
    });
    setPending(false);
    setMessage(
      error
        ? { type: "error", text: error.message }
        : {
            type: "info",
            text: `Magic link sent to ${email}. Check your inbox to finish signing in.`,
          },
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <AuthPage
        onProvider={handleProvider}
        onEmail={handleEmail}
        pending={pending}
        message={message}
      />

      <AnimatePresence>
        {authenticating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-[#02101a]/95 backdrop-blur-xl"
          >
            <p className="font-heading text-2xl font-semibold text-white">
              SWASTHYA
            </p>
            <ProgressiveFluxLoader
              value={progress}
              phases={PHASES}
              onComplete={() => setTimeout(() => router.push(redirectTo), 500)}
              textClassName="text-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginInner />
    </Suspense>
  );
}
