import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser, tableMissing } from "@/lib/api";
import { createConsultSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// GET /api/consults — all of the user's consults, soonest first.
export async function GET() {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("consults")
    .select("*")
    .order("scheduled_at", { ascending: true });

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Consults are temporarily unavailable. Please try again later.");
    return jsonError(500, error.message);
  }
  return NextResponse.json({ consults: data ?? [] });
}

// POST /api/consults — book a new consult.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, createConsultSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  // Snapshot the patient's name onto the consult so doctors can see who they're
  // treating without reading the patient's profile row.
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("full_name")
    .eq("id", ctx.user.id)
    .maybeSingle();
  const patientName =
    profile?.full_name ||
    (ctx.user.user_metadata?.full_name as string | undefined) ||
    ctx.user.email ||
    "Patient";

  // Booked unassigned → enters the shared queue for doctors of this specialty.
  const { data, error } = await ctx.supabase
    .from("consults")
    .insert({
      user_id: ctx.user.id,
      type: body.type,
      status: "SCHEDULED",
      scheduled_at: body.scheduledAt,
      language: body.language,
      notes: body.notes || null,
      patient_name: patientName,
    })
    .select()
    .single();

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Consults are temporarily unavailable. Please try again later.");
    return jsonError(500, error.message);
  }
  return NextResponse.json({ consult: data }, { status: 201 });
}
