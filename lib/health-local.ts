"use client";

/**
 * Local (mock-mode) persistence for the health profile.
 *
 * When Supabase isn't configured the app still needs onboarding answers to
 * survive a navigation, otherwise the user's sensitive health details (DOB,
 * blood group, allergies, pregnancy, emergency contact) would be silently
 * discarded. We mirror the same snake_case shape the Supabase `health_profiles`
 * row uses so the dashboard can read it back without any translation.
 */

export const HEALTH_LOCAL_KEY = "swasthya:health_profile";

export interface LocalHealthProfile {
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  phone: string | null;
  location: string | null;
  preferred_language: string | null;
  chronic_conditions: string[] | null;
  allergies: string | null;
  current_medications: string | null;
  is_pregnant: boolean | null;
  stress_level: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
}

export function readLocalHealth(): LocalHealthProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HEALTH_LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalHealthProfile) : null;
  } catch {
    return null;
  }
}

export function writeLocalHealth(profile: LocalHealthProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HEALTH_LOCAL_KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable (private mode / quota) — fail silently */
  }
}
