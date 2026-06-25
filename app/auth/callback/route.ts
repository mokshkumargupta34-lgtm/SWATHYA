import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES } from "@/lib/validators";

/**
 * Handles the redirect from Supabase after OAuth or a magic-link click.
 * Exchanges the `code` for a session cookie, then forwards to `next`.
 *
 * OAuth users don't pass through the password-signup metadata, so a doctor who
 * signs up with Google/GitHub arrives with `doctor=1` (+ specialty) and we set
 * their profile role here.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const asDoctor = searchParams.get("doctor") === "1";
  const specialtyParam = searchParams.get("specialty");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (asDoctor) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const specialty =
            specialtyParam && (SPECIALTIES as readonly string[]).includes(specialtyParam)
              ? specialtyParam
              : "GENERAL";
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            role: "doctor",
            specialty,
            updated_at: new Date().toISOString(),
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send the user back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
