import { NextResponse } from "next/server";
import { isDoctor, jsonError, requireDoctor } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// GET /api/doctor/patient-records/[id] — the health records (with AI insights)
// of a patient the doctor is treating. RLS only returns rows when the doctor has
// a consult for this patient in their specialty, so a doctor can't browse
// arbitrary patients' records.
export async function GET(_request: Request, { params }: Params) {
  const ctx = await requireDoctor();
  if (!isDoctor(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("health_records")
    .select(
      "id, type, title, notes, file_url, file_mime, ai_status, ai_insight, ai_model, ai_analyzed_at, recorded_at",
    )
    .eq("user_id", params.id)
    .order("recorded_at", { ascending: false });

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ records: data ?? [] });
}
