import { NextResponse } from "next/server";
import { isAuthed, jsonError, parseBody, requireUser } from "@/lib/api";
import { createOrderSchema, PLAN_PRICE_PAISE } from "@/lib/validators";
import { RAZORPAY_KEY_ID } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/payments/order — create a Razorpay order for a paid plan. The
// client opens checkout with the returned order id, then calls /verify.
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!isAuthed(ctx)) return ctx.response;

  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!RAZORPAY_KEY_ID || !secret) {
    return jsonError(
      503,
      "Payments aren't configured yet. Add your Razorpay keys to enable upgrades.",
    );
  }

  const parsed = await parseBody(request, createOrderSchema);
  if ("response" in parsed) return parsed.response;
  const { plan } = parsed.data;
  const amount = PLAN_PRICE_PAISE[plan];

  // Create the order directly against Razorpay's REST API (Basic auth).
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${secret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `plan_${plan}_${ctx.user.id.slice(0, 8)}_${Date.now()}`,
      notes: { userId: ctx.user.id, plan },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return jsonError(502, "Couldn't start checkout. Please try again.", detail.slice(0, 200));
  }

  const order = (await res.json()) as { id: string; amount: number; currency: string };
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: RAZORPAY_KEY_ID,
  });
}
