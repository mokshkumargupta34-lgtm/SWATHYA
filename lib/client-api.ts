"use client";

/**
 * Tiny typed fetch helpers for the Care Console client pages. Every call hits a
 * same-origin /api route that is session-scoped on the server, so we just send
 * cookies and surface a thrown Error with the server's message on failure.
 */

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  return handle<T>(res);
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle<T>(res);
}

// Shared row shapes (snake_case to match the Supabase tables).
export type HealthRecord = {
  id: string;
  type: "GENERAL" | "PRESCRIPTION" | "LAB" | "VACCINATION" | "GROWTH";
  title: string;
  notes: string | null;
  file_url: string | null;
  file_mime: string | null;
  ai_status: "NONE" | "DONE" | "ERROR" | null;
  ai_insight: string | null;
  ai_model: string | null;
  ai_analyzed_at: string | null;
  recorded_at: string;
  created_at: string;
};

export type Consult = {
  id: string;
  type: "GENERAL" | "SPECIALIST" | "MENTAL" | "MATERNAL";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  scheduled_at: string;
  language: string;
  notes: string | null;
  doctor_name: string | null;
  doctor_notes?: string | null;
  prescription?: string | null;
  patient_name?: string | null;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  dob: string | null;
  created_at: string;
};

export type MedicineResult = {
  id: string;
  name: string;
  genericName: string | null;
  isGeneric: boolean;
  price: number;
  inStock: boolean;
  stock: {
    pharmacy: string;
    village: string;
    distanceKm: number;
    price: number;
    quantity: number;
  }[];
  alternative: Omit<MedicineResult, "alternative"> | null;
};
