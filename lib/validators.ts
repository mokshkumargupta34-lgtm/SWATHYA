import { z } from "zod";

// Shared enums (kept in sync with the check constraints in supabase/schema.sql).
export const RECORD_TYPES = [
  "GENERAL",
  "PRESCRIPTION",
  "LAB",
  "VACCINATION",
  "GROWTH",
] as const;

export const CONSULT_TYPES = [
  "GENERAL",
  "SPECIALIST",
  "MENTAL",
  "MATERNAL",
] as const;

export const CONSULT_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export const PLANS = ["JAN", "PARIVAR", "SAMUDAY"] as const;

export const LANGUAGES = [
  "en",
  "hi",
  "bn",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
] as const;

// Up to how many family members each plan may have (the user themself is not
// counted as a "member").
export const FAMILY_LIMIT: Record<(typeof PLANS)[number], number> = {
  JAN: 0,
  PARIVAR: 6,
  SAMUDAY: 1000,
};

export const createRecordSchema = z.object({
  type: z.enum(RECORD_TYPES).default("GENERAL"),
  title: z.string().trim().min(1, "Title is required").max(140),
  notes: z.string().trim().max(4000).optional().nullable(),
  fileUrl: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  recordedAt: z.string().datetime().optional(),
});
export type CreateRecordInput = z.infer<typeof createRecordSchema>;

export const createConsultSchema = z.object({
  type: z.enum(CONSULT_TYPES).default("GENERAL"),
  scheduledAt: z.string().datetime({ message: "Pick a valid date & time" }),
  language: z.enum(LANGUAGES).default("en"),
  notes: z.string().trim().max(2000).optional().nullable(),
});
export type CreateConsultInput = z.infer<typeof createConsultSchema>;

export const patchConsultSchema = z.object({
  status: z.enum(CONSULT_STATUSES).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const createFamilySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  relation: z.string().trim().min(1, "Relation is required").max(60),
  dob: z.string().date().optional().nullable().or(z.literal("")),
});

export const patchProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  language: z.enum(LANGUAGES).optional(),
});

export const patchPlanSchema = z.object({
  plan: z.enum(PLANS),
});

// ---- Payments (Razorpay) ---------------------------------------------------
// Only the paid plans go through checkout. JAN is free (instant switch).
export const PAID_PLANS = ["PARIVAR", "SAMUDAY"] as const;

// Price per plan in paise (₹1 = 100 paise), kept in sync with the UI labels.
export const PLAN_PRICE_PAISE: Record<(typeof PAID_PLANS)[number], number> = {
  PARIVAR: 9900, // ₹99/mo
  SAMUDAY: 49900, // ₹499/mo
};

export const createOrderSchema = z.object({ plan: z.enum(PAID_PLANS) });

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan: z.enum(PAID_PLANS),
});

// ---- Doctor portal ---------------------------------------------------------
// A doctor's specialty maps 1:1 to a consult type.
export const SPECIALTIES = CONSULT_TYPES;

export const SPECIALTY_LABELS: Record<(typeof SPECIALTIES)[number], string> = {
  GENERAL: "General physician",
  SPECIALIST: "Specialist",
  MENTAL: "Mental health",
  MATERNAL: "Maternal & child",
};

// What a doctor can do to a consult.
export const doctorActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("accept") }),
  z.object({
    action: z.literal("complete"),
    doctorNotes: z.string().trim().max(4000).optional().nullable(),
    prescription: z.string().trim().max(4000).optional().nullable(),
  }),
  z.object({
    action: z.literal("reschedule"),
    scheduledAt: z.string().datetime(),
  }),
  z.object({ action: z.literal("cancel") }),
]);
export type DoctorAction = z.infer<typeof doctorActionSchema>;
