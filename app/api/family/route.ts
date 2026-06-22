import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser, tableMissing } from "@/lib/api";
import { createFamilySchema, FAMILY_LIMIT, PLANS } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Plan = (typeof PLANS)[number];

// GET /api/family — members plus the current plan and its limit, so the UI can
// show "3 / 6 used" without a second request.
export async function GET() {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const [members, profile] = await Promise.all([
    ctx.supabase
      .from("family_members")
      .select("*")
      .order("created_at", { ascending: true }),
    ctx.supabase.from("profiles").select("plan").eq("id", ctx.user.id).maybeSingle(),
  ]);

  if (members.error) {
    if (tableMissing(members.error.message))
      return jsonError(503, "Family management is temporarily unavailable. Please try again later.");
    return jsonError(500, members.error.message);
  }

  const plan = ((profile.data?.plan as Plan) ?? "JAN") satisfies Plan;
  return NextResponse.json({
    members: members.data ?? [],
    plan,
    limit: FAMILY_LIMIT[plan] ?? 0,
  });
}

// POST /api/family — add a member, enforcing the plan limit server-side.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, createFamilySchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("plan")
    .eq("id", ctx.user.id)
    .maybeSingle();
  const plan = ((profile?.plan as Plan) ?? "JAN") satisfies Plan;
  const limit = FAMILY_LIMIT[plan] ?? 0;

  const { count } = await ctx.supabase
    .from("family_members")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) >= limit) {
    return jsonError(
      403,
      plan === "JAN"
        ? "Your Individual (JAN) plan covers only you. Upgrade to Family+ to add members."
        : `You've reached your plan's limit of ${limit} family members.`,
    );
  }

  const { data, error } = await ctx.supabase
    .from("family_members")
    .insert({
      user_id: ctx.user.id,
      name: body.name,
      relation: body.relation,
      dob: body.dob || null,
    })
    .select()
    .single();

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ member: data }, { status: 201 });
}
