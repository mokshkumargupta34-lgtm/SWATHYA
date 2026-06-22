import { NextResponse } from "next/server";
import { isAuthed, jsonError, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// DELETE /api/family/[id] — RLS ensures only the owner's row can be removed.
export async function DELETE(_request: Request, { params }: Params) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const { error } = await ctx.supabase
    .from("family_members")
    .delete()
    .eq("id", params.id);

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ ok: true });
}
