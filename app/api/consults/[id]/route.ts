import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { patchConsultSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PATCH /api/consults/[id] — cancel or reschedule.
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const parsed = await parseBody(request, patchConsultSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.scheduledAt) update.scheduled_at = body.scheduledAt;
  if (Object.keys(update).length === 0)
    return jsonError(400, "Nothing to update");

  const { data, error } = await ctx.supabase
    .from("consults")
    .update(update)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  if (!data) return jsonError(404, "Consult not found");
  return NextResponse.json({ consult: data });
}
