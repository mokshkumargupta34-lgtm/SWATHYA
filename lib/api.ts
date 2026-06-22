import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Standard JSON error response. */
export function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: message, ...(extra ? { details: extra } : {}) },
    { status },
  );
}

export type AuthedContext = {
  supabase: SupabaseClient;
  user: User;
};

/**
 * Resolve the signed-in user for a route handler. Returns either the context
 * (supabase client + user) or a ready-to-return 401/503 response. Every API
 * route starts with this so no endpoint is reachable without a session, and so
 * the app degrades gracefully when Supabase keys aren't configured yet.
 */
export async function requireUser(): Promise<
  AuthedContext | { response: NextResponse }
> {
  if (!isSupabaseConfigured) {
    return { response: jsonError(503, "Backend not configured") };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { response: jsonError(401, "Not authenticated") };
  }
  return { supabase, user };
}

/** Narrowing helper for the union returned by requireUser. */
export function isAuthed(
  ctx: AuthedContext | { response: NextResponse },
): ctx is AuthedContext {
  return "user" in ctx;
}

/** Parse a request body with a zod schema, returning a 400 response on failure. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<{ data: z.infer<S> } | { response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { response: jsonError(400, "Invalid JSON body") };
  }
  try {
    return { data: schema.parse(raw) };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        response: jsonError(400, "Validation failed", err.flatten().fieldErrors),
      };
    }
    return { response: jsonError(400, "Invalid request") };
  }
}

/** Translate a Postgres "table missing" error into a friendly hint. */
export function tableMissing(message?: string | null) {
  return (
    !!message &&
    /relation .* does not exist|could not find the table|schema cache/i.test(
      message,
    )
  );
}
