import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { patchPlanSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// PATCH /api/profile/plan — change the user's subscription plan.
export async function PATCH(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, patchPlanSchema);
  if ("response" in parsed) return parsed.response;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .upsert({
      id: ctx.user.id,
      email: ctx.user.email,
      plan: parsed.data.plan,
      updated_at: new Date().toISOString(),
    })
    .select("id, email, full_name, avatar_url, plan, language")
    .single();

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ profile: data });
}
