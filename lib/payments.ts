// Client-safe Razorpay config. Only the *public* key id is exposed here; the
// secret is read server-side (in the API routes) and never shipped to the
// browser. When no key is set the UI falls back to a "Payment unavailable"
// state and the free JAN plan still switches instantly.

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

/** True once a Razorpay public key is configured (client + server safe). */
export const isRazorpayConfigured = RAZORPAY_KEY_ID.length > 10;

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
