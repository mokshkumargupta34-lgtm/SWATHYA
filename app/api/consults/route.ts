import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser, tableMissing } from "@/lib/api";
import { createConsultSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const DOCTORS: Record<string, string> = {
  GENERAL: "Dr. Anand Rao",
  SPECIALIST: "Dr. Meera Iyer",
  MENTAL: "Dr. Kabir Sen",
  MATERNAL: "Dr. Leela Nair",
};

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

  const { data, error } = await ctx.supabase
    .from("consults")
    .insert({
      user_id: ctx.user.id,
      type: body.type,
      status: "SCHEDULED",
      scheduled_at: body.scheduledAt,
      language: body.language,
      notes: body.notes || null,
      doctor_name: DOCTORS[body.type] ?? "Dr. Anand Rao",
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
