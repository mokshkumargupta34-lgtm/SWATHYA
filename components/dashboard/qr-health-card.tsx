"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, Loader2, QrCode } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/**
 * A portable, offline-readable health card: the QR encodes a compact text
 * summary (no link), so scanning it shows the essentials even with no network —
 * for migrant/mobile workers carrying their record across cities.
 */
export function QRHealthCard() {
  const supabase = React.useMemo(
    () => (isSupabaseConfigured ? createClient() : null),
    [],
  );
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [empty, setEmpty] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) {
        setLoading(false);
        return;
      }
      const [{ data: profile }, { data: h }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("health_profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      if (!active) return;

      const who = profile?.full_name || user.email || "Patient";
      setName(who);

      const lines = ["SANJEEVANI HEALTH CARD", `Name: ${who}`];
      if (h) {
        if (h.date_of_birth) lines.push(`DOB: ${h.date_of_birth}`);
        if (h.gender) lines.push(`Sex: ${h.gender}`);
        if (h.blood_group) lines.push(`Blood: ${h.blood_group}`);
        const cond = (h.chronic_conditions ?? []).filter(
          (c: string) => c && c !== "None",
        );
        if (cond.length) lines.push(`Conditions: ${cond.join(", ")}`);
        if (h.allergies) lines.push(`Allergies: ${h.allergies}`);
        if (h.current_medications) lines.push(`Meds: ${h.current_medications}`);
        if (h.emergency_contact_name || h.emergency_contact_phone)
          lines.push(
            `Emergency: ${`${h.emergency_contact_name ?? ""} ${h.emergency_contact_phone ?? ""}`.trim()}`,
          );
      }
      if (lines.length <= 2) setEmpty(true);

      try {
        const url = await QRCode.toDataURL(lines.join("\n"), {
          width: 320,
          margin: 1,
          color: { dark: "#0c3645", light: "#ffffff" },
        });
        if (active) setDataUrl(url);
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <QrCode className="h-5 w-5" />
        </span>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Portable health card
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Building your card…
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="Health card QR code"
              className="h-40 w-40 shrink-0 rounded-2xl border border-border bg-white p-2"
            />
          ) : null}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan to read the essentials — blood group, conditions, allergies and
              emergency contact. Works offline; no link, the data lives in the code.
            </p>
            {empty ? (
              <p className="mt-2 text-xs text-amber-600">
                Add your health profile in onboarding to fill the card.
              </p>
            ) : null}
            {dataUrl ? (
              <a
                href={dataUrl}
                download="sanjeevani-health-card.png"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
