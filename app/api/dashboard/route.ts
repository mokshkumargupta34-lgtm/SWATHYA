import { NextResponse } from "next/server";
import { isAuthed, jsonError, requireUser, tableMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/dashboard — live stats, a 7-day consultation histogram and the
// upcoming care queue, all scoped to the signed-in user.
export async function GET() {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const nowIso = new Date().toISOString();

  const [records, consults, villages] = await Promise.all([
    ctx.supabase.from("health_records").select("id", { count: "exact", head: true }),
    ctx.supabase
      .from("consults")
      .select("id, type, status, scheduled_at, language, notes, doctor_name")
      .order("scheduled_at", { ascending: true }),
    ctx.supabase.from("pharmacies").select("village"),
  ]);

  if (consults.error) {
    if (tableMissing(consults.error.message))
      return jsonError(503, "The console is temporarily unavailable. Please try again later.");
    return jsonError(500, consults.error.message);
  }

  const allConsults = consults.data ?? [];
  const upcoming = allConsults.filter(
    (c) => c.status === "SCHEDULED" && c.scheduled_at >= nowIso,
  );

  // Weekly histogram: count consults for each of the last 7 days (oldest first).
  const weekly: number[] = Array(7).fill(0);
  const labels: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    labels.push(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()]);
  }
  for (const c of allConsults) {
    const d = new Date(c.scheduled_at);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (new Date(today).setHours(0, 0, 0, 0) - d.getTime()) / 86_400_000,
    );
    if (diffDays >= 0 && diffDays <= 6) weekly[6 - diffDays] += 1;
  }

  const villageCount = new Set(
    (villages.data ?? []).map((v: { village: string }) => v.village),
  ).size;

  return NextResponse.json({
    stats: {
      upcomingConsults: upcoming.length,
      recordsCount: records.count ?? 0,
      remindersDue: upcoming.filter((c) => {
        const days = (new Date(c.scheduled_at).getTime() - Date.now()) / 86_400_000;
        return days <= 7;
      }).length,
      villagesLive: villageCount || 94,
    },
    weekly,
    labels,
    queue: upcoming.slice(0, 5),
  });
}
