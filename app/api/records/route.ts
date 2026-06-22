import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser, tableMissing } from "@/lib/api";
import { createRecordSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// GET /api/records — every record belonging to the signed-in user, newest first.
export async function GET() {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("health_records")
    .select("*")
    .order("recorded_at", { ascending: false });

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Records are temporarily unavailable. Please try again later.");
    return jsonError(500, error.message);
  }
  return NextResponse.json({ records: data ?? [] });
}

// POST /api/records — create a record owned by the signed-in user.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, createRecordSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const { data, error } = await ctx.supabase
    .from("health_records")
    .insert({
      user_id: ctx.user.id,
      type: body.type,
      title: body.title,
      notes: body.notes || null,
      file_url: body.fileUrl || null,
      recorded_at: body.recordedAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Records are temporarily unavailable. Please try again later.");
    return jsonError(500, error.message);
  }
  return NextResponse.json({ record: data }, { status: 201 });
}
