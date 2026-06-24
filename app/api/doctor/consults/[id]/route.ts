import { NextResponse } from "next/server";
import { isDoctor, jsonError, parseBody, requireDoctor } from "@/lib/api";
import { doctorActionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PATCH /api/doctor/consults/[id] — accept / complete / reschedule / cancel.
// RLS guarantees the doctor can only touch consults in their specialty or
// already assigned to them.
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await requireDoctor();
  if (!isDoctor(ctx)) return ctx.response;

  const parsed = await parseBody(request, doctorActionSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const update: Record<string, unknown> = {};
  switch (body.action) {
    case "accept":
      update.doctor_id = ctx.user.id;
      update.doctor_name = ctx.fullName ?? "Your doctor";
      break;
    case "complete":
      update.status = "COMPLETED";
      update.doctor_id = ctx.user.id;
      update.doctor_name = ctx.fullName ?? "Your doctor";
      update.doctor_notes = body.doctorNotes || null;
      update.prescription = body.prescription || null;
      break;
    case "reschedule":
      update.scheduled_at = body.scheduledAt;
      break;
    case "cancel":
      update.status = "CANCELLED";
      break;
  }

  const { data, error } = await ctx.supabase
    .from("consults")
    .update(update)
    .eq("id", params.id)
    .select(
      "id, type, status, scheduled_at, language, notes, patient_name, patient_id:user_id, doctor_id, doctor_name, doctor_notes, prescription, created_at",
    )
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  if (!data) return jsonError(404, "Consult not found or not in your queue");
  return NextResponse.json({ consult: { ...data, mine: data.doctor_id === ctx.user.id } });
}
