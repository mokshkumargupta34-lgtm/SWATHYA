import { NextResponse } from "next/server";
import { isDoctor, jsonError, requireDoctor } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// GET /api/doctor/patient-health/[id] — the health profile of a patient the
// doctor is treating. RLS only returns a row when the doctor has a consult for
// this patient in their specialty, so a doctor can't browse arbitrary patients.
export async function GET(_request: Request, { params }: Params) {
  const ctx = await requireDoctor();
  if (!isDoctor(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("health_profiles")
    .select(
      "date_of_birth, gender, blood_group, height_cm, weight_kg, preferred_language, chronic_conditions, allergies, current_medications, is_pregnant",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  if (!data) return jsonError(404, "No health profile available for this patient");
  return NextResponse.json({ health: data });
}
