import { NextResponse } from "next/server";
import { isAuthed, jsonError, requireUser, tableMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

type StockRow = {
  quantity: number;
  price: number;
  pharmacies: { name: string; village: string; distance_km: number } | null;
};

type MedicineRow = {
  id: string;
  name: string;
  generic_name: string | null;
  is_generic: boolean;
  price: number;
  medicine_stock: StockRow[] | null;
};

// GET /api/medicines?q= — pharmacy stock for matching medicines plus, for each
// branded medicine, a cheaper generic alternative when one exists.
export async function GET(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  // Pull the whole (small) catalog with nested stock + pharmacy details. The
  // generic-alternative lookup needs every medicine in scope anyway.
  const { data, error } = await ctx.supabase
    .from("medicines")
    .select(
      "id, name, generic_name, is_generic, price, medicine_stock ( quantity, price, pharmacies ( name, village, distance_km ) )",
    )
    .order("name", { ascending: true });

  if (error) {
    if (tableMissing(error.message))
      return jsonError(503, "The medicine catalog is temporarily unavailable. Please try again later.");
    return jsonError(500, error.message);
  }

  const all = (data ?? []) as unknown as MedicineRow[];

  const matches = q
    ? all.filter(
        (m) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          (m.generic_name ?? "").toLowerCase().includes(q.toLowerCase()),
      )
    : all;

  const shape = (m: MedicineRow) => ({
    id: m.id,
    name: m.name,
    genericName: m.generic_name,
    isGeneric: m.is_generic,
    price: m.price,
    inStock: (m.medicine_stock ?? []).some((s) => s.quantity > 0),
    stock: (m.medicine_stock ?? [])
      .map((s) => ({
        pharmacy: s.pharmacies?.name ?? "Unknown",
        village: s.pharmacies?.village ?? "",
        distanceKm: s.pharmacies?.distance_km ?? 0,
        price: s.price,
        quantity: s.quantity,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm),
  });

  const results = matches.map((m) => {
    // Find the cheapest generic that shares this medicine's generic name and
    // costs less — the "switch and save" suggestion.
    let alternative = null as ReturnType<typeof shape> | null;
    if (!m.is_generic && m.generic_name) {
      const generics = all
        .filter(
          (g) =>
            g.is_generic &&
            g.id !== m.id &&
            g.generic_name === m.generic_name &&
            g.price < m.price,
        )
        .sort((a, b) => a.price - b.price);
      if (generics[0]) alternative = shape(generics[0]);
    }
    return { ...shape(m), alternative };
  });

  return NextResponse.json({ query: q, results });
}
