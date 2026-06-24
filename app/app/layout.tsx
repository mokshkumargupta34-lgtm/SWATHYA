import { redirect } from "next/navigation";
import { AppShell, type ShellUser } from "@/components/app/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Protected shell for the Care Console. The middleware already blocks
 * unauthenticated visitors, but we re-check here (defense in depth) and load
 * the user's name + plan to dress the sidebar.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: ShellUser = { name: "", email: "", plan: "JAN" };

  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) redirect("/login?redirect=/app");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, plan, role")
      .eq("id", authUser.id)
      .maybeSingle();

    // Doctors belong in the doctor console, not the patient app.
    if (profile?.role === "doctor") redirect("/doctor");

    user = {
      name:
        profile?.full_name ||
        (authUser.user_metadata?.full_name as string | undefined) ||
        "",
      email: authUser.email ?? "",
      plan: profile?.plan ?? "JAN",
    };
  }

  return <AppShell user={user}>{children}</AppShell>;
}
