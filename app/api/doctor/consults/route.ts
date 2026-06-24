import { NextResponse } from "next/server";
import { isDoctor, jsonError, requireDoctor, tableMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/doctor/consults — every consult the signed-in doctor may see (RLS:
// their specialty's shared queue + anything assigned to them), with a `mine`
// flag so the UI can split "my consults" from the open queue.
export async function GET() {
  const ctx = await requireDoctor();
  if (!isDoctor(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("consults")
    .select(
      "id, type, status, scheduled_at, language, notes, patient_name, patient_id:user_id, doctor_id, doctor_name, doctor_notes, prescription, created_at",
    )
    .order("scheduled_at", { ascending: true });

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Run supabase/schema.sql to enable the doctor portal.");
    return jsonError(500, error.message);
  }

  const consults = (data ?? []).map((c) => ({
    ...c,
    mine: c.doctor_id === ctx.user.id,
  }));

  return NextResponse.json({ specialty: ctx.specialty, consults });
}
