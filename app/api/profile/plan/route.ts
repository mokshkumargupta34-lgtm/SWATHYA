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

  // Paid plans must go through verified payment (/api/payments/*). This route
  // only handles the free plan — i.e. downgrading / cancelling to JAN.
  if (parsed.data.plan !== "JAN") {
    return jsonError(402, "Paid plans require checkout. Use the upgrade button.");
  }

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
