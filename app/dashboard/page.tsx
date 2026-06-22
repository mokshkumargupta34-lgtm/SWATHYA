import { redirect } from "next/navigation";

// The Care Console now lives under /app. Keep this route as a permanent
// redirect so old links, bookmarks and the onboarding flow still land safely.
export default function DashboardRedirect() {
  redirect("/app");
}
