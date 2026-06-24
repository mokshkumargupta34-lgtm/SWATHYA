import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { verifyPaymentSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// POST /api/payments/verify — confirm the Razorpay signature, then (and only
// then) activate the paid plan on the user's profile. This is what makes the
// plan switch payment-gated instead of a free click.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!secret) return jsonError(503, "Payments aren't configured.");

  const parsed = await parseBody(request, verifyPaymentSchema);
  if ("response" in parsed) return parsed.response;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = parsed.data;

  // Razorpay signs `${order_id}|${payment_id}` with HMAC-SHA256(keySecret).
  const expected = createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return jsonError(400, "Payment verification failed.");

  // Signature is valid → upgrade the plan.
  const { data, error } = await ctx.supabase
    .from("profiles")
    .upsert({
      id: ctx.user.id,
      email: ctx.user.email,
      plan,
      updated_at: new Date().toISOString(),
    })
    .select("id, email, full_name, avatar_url, plan, language")
    .single();

  if (error) return jsonError(500, error.message);
  return NextResponse.json({ profile: data });
}
