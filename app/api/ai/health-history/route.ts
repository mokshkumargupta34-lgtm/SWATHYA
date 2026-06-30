import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { buildHealthHistory, isAIConfigured } from "@/lib/ai";
import { healthHistorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// POST /api/ai/health-history — turn a few answers into a clean, shareable
// medical-history summary (for workers with no written records).
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;
  if (!isAIConfigured)
    return jsonError(503, "AI isn't enabled yet — add a Groq API key to use the history builder.");

  const parsed = await parseBody(request, healthHistorySchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { text, model } = await buildHealthHistory(parsed.data);
    return NextResponse.json({ text, model });
  } catch (e) {
    return jsonError(502, (e as Error).message);
  }
}
