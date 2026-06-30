import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { isAIConfigured, symptomTriage } from "@/lib/ai";
import { symptomCheckSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// POST /api/ai/symptom-check — cautious, non-diagnostic symptom guidance.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;
  if (!isAIConfigured)
    return jsonError(503, "AI isn't enabled yet — add a Groq API key to use the symptom checker.");

  const parsed = await parseBody(request, symptomCheckSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { text, model } = await symptomTriage(parsed.data);
    return NextResponse.json({ text, model });
  } catch (e) {
    return jsonError(502, (e as Error).message);
  }
}
