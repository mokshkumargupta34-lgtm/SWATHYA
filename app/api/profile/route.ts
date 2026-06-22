import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser, tableMissing } from "@/lib/api";
import { patchProfileSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// GET /api/profile — the signed-in user's profile (name, plan, language).
export async function GET() {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, plan, language")
    .eq("id", ctx.user.id)
    .maybeSingle();

  if (error && !tableMissing(error.message)) return jsonError(500, error.message);

  return NextResponse.json({
    profile: data ?? {
      id: ctx.user.id,
      email: ctx.user.email,
      full_name:
        (ctx.user.user_metadata?.full_name as string | undefined) ?? null,
      avatar_url: null,
      plan: "JAN",
      language: "en",
    },
  });
}

// PATCH /api/profile — update display name and/or preferred language.
export async function PATCH(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, patchProfileSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const update: Record<string, unknown> = {
    id: ctx.user.id,
    email: ctx.user.email,
    updated_at: new Date().toISOString(),
  };
  if (body.fullName !== undefined) update.full_name = body.fullName;
  if (body.language !== undefined) update.language = body.language;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .upsert(update)
    .select("id, email, full_name, avatar_url, plan, language")
    .single();

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ profile: data });
}
