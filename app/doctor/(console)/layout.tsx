import { redirect } from "next/navigation";
import { DoctorShell, type DoctorInfo } from "@/components/doctor/doctor-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Guarded shell for the doctor console. Only role = 'doctor' may enter; signed-in
 * patients are bounced to their own /app, and anonymous visitors to the doctor
 * login. (The login/signup pages live outside this route group, so they aren't
 * wrapped by this guard.)
 */
export default async function DoctorConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let doctor: DoctorInfo = { name: "", email: "", specialty: null };

  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/doctor/login?redirect=/doctor");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, specialty")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "doctor") redirect("/app");

    doctor = {
      name:
        profile?.full_name ||
        (user.user_metadata?.full_name as string | undefined) ||
        "",
      email: user.email ?? "",
      specialty: profile?.specialty ?? null,
    };
  }

  return <DoctorShell doctor={doctor}>{children}</DoctorShell>;
}
