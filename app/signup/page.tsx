"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SignUpForm,
  type SignUpProvider,
  type SignUpValues,
} from "@/components/ui/sign-up-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type Msg = { type: "info" | "error"; text: string } | null;

export default function SignUpPage() {
  const router = useRouter();
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<Msg>(null);

  const callbackUrl = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const handleSubmit = async (v: SignUpValues) => {
    if (!supabase) {
      // Mock mode (no Supabase keys): just continue to onboarding/dashboard.
      router.push("/onboarding");
      return;
    }
    setPending(true);
    setMessage(null);
    const fullName = `${v.firstName} ${v.lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        data: {
          full_name: fullName,
          first_name: v.firstName,
          last_name: v.lastName,
        },
        emailRedirectTo: callbackUrl("/onboarding"),
      },
    });
    setPending(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (data.session) {
      // Email confirmation disabled → straight into onboarding.
      router.push("/onboarding");
    } else {
      setMessage({
        type: "info",
        text: "Account created! Check your email to confirm, then you'll continue to set up your health profile.",
      });
    }
  };

  const handleProvider = async (provider: SignUpProvider) => {
    if (!supabase) {
      router.push("/onboarding");
      return;
    }
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl("/onboarding") },
    });
    if (error) {
      setPending(false);
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <SignUpForm
      onSubmit={handleSubmit}
      onProvider={handleProvider}
      pending={pending}
      message={message}
    />
  );
}
