import { NextResponse } from "next/server";
import { isAuthed, jsonError, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// GET /api/records/[id] — RLS guarantees this only resolves for the owner.
export async function GET(_request: Request, { params }: Params) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { data, error } = await ctx.supabase
    .from("health_records")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  if (!data) return jsonError(404, "Record not found");
  return NextResponse.json({ record: data });
}

// DELETE /api/records/[id]
export async function DELETE(_request: Request, { params }: Params) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { error } = await ctx.supabase
    .from("health_records")
    .delete()
    .eq("id", params.id);

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ ok: true });
}
