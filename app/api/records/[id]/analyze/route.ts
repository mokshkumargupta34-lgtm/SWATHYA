import { NextResponse } from "next/server";
import { isAuthed, jsonError, requireUser, tableMissing } from "@/lib/api";
import { analyzeHealthRecord, isAIConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: { id: string } };

// POST /api/records/[id]/analyze — run an AI explanation over a record's
// attachment and store it on the row. RLS scopes the lookup to the owner.
export async function POST(_request: Request, { params }: Params) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  if (!isAIConfigured)
    return jsonError(
      503,
      "AI analysis isn't set up yet. Add a (free) GROQ_API_KEY to enable it (PDF scans also need GEMINI_API_KEY).",
    );

  const { data: record, error } = await ctx.supabase
    .from("health_records")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "Records are temporarily unavailable. Please try again later.");
    return jsonError(404, "Record not found.");
  }
  if (!record.file_url)
    return jsonError(400, "Add a photo or PDF to this record before analyzing it.");

  try {
    const { insight, model } = await analyzeHealthRecord({
      type: record.type,
      title: record.title,
      notes: record.notes,
      fileUrl: record.file_url,
      fileMime: record.file_mime,
    });

    const { data: updated, error: upErr } = await ctx.supabase
      .from("health_records")
      .update({
        ai_status: "DONE",
        ai_insight: insight,
        ai_model: model,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (upErr) return jsonError(500, upErr.message);
    return NextResponse.json({ record: updated });
  } catch (e) {
    // Best-effort: mark the row so the UI can offer a retry.
    await ctx.supabase
      .from("health_records")
      .update({ ai_status: "ERROR" })
      .eq("id", params.id);
    return jsonError(502, (e as Error).message || "AI analysis failed. Please try again.");
  }
}
