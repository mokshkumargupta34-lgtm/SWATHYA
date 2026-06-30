import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { isAIConfigured, wellnessReply } from "@/lib/ai";
import { wellnessSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// POST /api/ai/wellness — one turn of the CBT-style wellness companion.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;
  if (!isAIConfigured)
    return jsonError(503, "AI isn't enabled yet — add a Groq API key to use the wellness companion.");

  const parsed = await parseBody(request, wellnessSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const { text, model } = await wellnessReply(parsed.data);
    return NextResponse.json({ text, model });
  } catch (e) {
    return jsonError(502, (e as Error).message);
  }
}
