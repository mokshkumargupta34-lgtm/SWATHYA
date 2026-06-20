// Central place to read Supabase env vars and detect whether the project is
// actually configured. When it isn't, the app gracefully falls back to the
// front-end "mock" login so the demo keeps working until real keys are added.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
