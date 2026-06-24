import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

const PROTECTED = ["/app", "/doctor", "/dashboard", "/onboarding"];
// Auth screens an already-signed-in user shouldn't see.
const AUTH_PAGES = ["/login", "/signup", "/doctor/login", "/doctor/signup"];

/**
 * Refreshes the Supabase auth session on every request and guards protected
 * routes. No-ops entirely when Supabase isn't configured, so the mock login
 * keeps working until real keys are provided.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() must be called to refresh the token cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = AUTH_PAGES.some((p) => path === p);
  const isDoctorArea = path === "/doctor" || path.startsWith("/doctor/");
  const needsAuth =
    !isAuthPage && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isDoctorArea ? "/doctor/login" : "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Signed-in users shouldn't sit on the login / signup screens.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = isDoctorArea ? "/doctor" : "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
