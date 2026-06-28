"use client";

import * as React from "react";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Pill,
  Search,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, type MedicineResult } from "@/lib/client-api";
import {
  bearingFromString,
  destinationPoint,
  formatKm,
  haversineKm,
  type LatLng,
} from "@/lib/geo";
import {
  ErrorNote,
  PageContainer,
  PageHeading,
  SectionCard,
  Spinner,
} from "@/components/app/primitives";

const GEO_KEY = "sanjeevani:geo";

type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "error"
  | "unsupported";

function price(n: number) {
  return n === 0 ? "Free" : `₹${n}`;
}

export default function MedicinesPage() {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<MedicineResult[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [coords, setCoords] = React.useState<LatLng | null>(null);
  const [geoStatus, setGeoStatus] = React.useState<GeoStatus>("idle");

  // Ask the browser for the user's location. All distance math stays client-side.
  const requestLocation = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setGeoStatus("granted");
        try {
          localStorage.setItem(GEO_KEY, JSON.stringify(c));
        } catch {
          /* storage unavailable — ignore */
        }
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  // On first load, reuse a remembered location, otherwise prompt for access.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(GEO_KEY);
      if (raw) {
        setCoords(JSON.parse(raw) as LatLng);
        setGeoStatus("granted");
        return;
      }
    } catch {
      /* ignore */
    }
    requestLocation();
  }, [requestLocation]);

  // Debounced live search against the catalog.
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    const id = setTimeout(() => {
      apiGet<{ results: MedicineResult[] }>(
        `/api/medicines?q=${encodeURIComponent(q)}`,
      )
        .then((r) => {
          if (active) setResults(r.results);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [q]);

  return (
    <PageContainer>
      <PageHeading
        icon={Pill}
        title="Medicine availability"
        subtitle="Live stock at pharmacies near you — distances, directions and cheaper generics."
      />

      <LocationBanner status={geoStatus} onEnable={requestLocation} />

      <SectionCard>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            aria-label="Search medicines"
            placeholder="Search a medicine — try “Paracetamol”, “Augmentin”…"
            className="w-full rounded-2xl border border-input bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </SectionCard>

      <ErrorNote>{error}</ErrorNote>

      {loading && !results ? (
        <SectionCard>
          <Spinner label="Loading catalog…" />
        </SectionCard>
      ) : results && results.length === 0 ? (
        <SectionCard>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No matches — try a generic name like “Paracetamol” or “Metformin”.
          </p>
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {results?.map((m) => (
            <MedicineCard key={m.id} med={m} coords={coords} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function LocationBanner({
  status,
  onEnable,
}: {
  status: GeoStatus;
  onEnable: () => void;
}) {
  if (status === "granted") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-emerald-700">
          <LocateFixed className="h-4 w-4" /> Pharmacies sorted by distance from your location.
        </span>
        <button
          onClick={onEnable}
          className="text-xs font-medium text-emerald-700 underline underline-offset-2"
        >
          Update location
        </button>
      </div>
    );
  }

  if (status === "prompting") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Requesting your location…
      </div>
    );
  }

  const message =
    status === "denied"
      ? "Location is blocked. Allow it in your browser to see real distances and directions."
      : status === "unsupported"
        ? "Your browser doesn’t support location — showing sample distances."
        : status === "error"
          ? "Couldn’t get your location. Showing sample distances — try again."
          : "Enable location to see how far each pharmacy is and get directions.";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-amber-700">
        <MapPin className="h-4 w-4 shrink-0" /> {message}
      </span>
      {status !== "unsupported" ? (
        <button
          onClick={onEnable}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
        >
          <LocateFixed className="h-3.5 w-3.5" /> Enable location
        </button>
      ) : null}
    </div>
  );
}

function MedicineCard({
  med,
  coords,
}: {
  med: MedicineResult;
  coords: LatLng | null;
}) {
  // Place each sample pharmacy at its catalogued distance from the user (along a
  // stable bearing), then compute the real distance + a directions link.
  const stores = React.useMemo(() => {
    const rows = med.stock.map((s) => {
      if (!coords) return { s, dist: s.distanceKm, mapsUrl: null as string | null };
      const point = destinationPoint(coords, s.distanceKm, bearingFromString(s.pharmacy));
      const dist = haversineKm(coords, point);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${point.lat},${point.lng}`;
      return { s, dist, mapsUrl };
    });
    return rows.sort((a, b) => a.dist - b.dist);
  }, [med.stock, coords]);

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium text-foreground">{med.name}</p>
            <p className="text-xs text-muted-foreground">
              {med.genericName ?? "—"}
              {med.isGeneric ? " · Generic" : " · Branded"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            med.inStock ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600",
          )}
        >
          {med.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      {stores.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {stores.map(({ s, dist, mapsUrl }, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.pharmacy}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{s.village}</span>
                    <span aria-hidden>·</span>
                    <span className={cn(coords && "font-medium text-foreground")}>
                      {coords ? `${formatKm(dist)} away` : `~${s.distanceKm} km`}
                    </span>
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <Navigation className="h-3 w-3" /> Directions
                      </a>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-foreground">{price(s.price)}</p>
                <p
                  className={cn(
                    "font-mono text-[11px] font-medium",
                    s.quantity > 0 ? "text-emerald-600" : "text-rose-500",
                  )}
                >
                  {s.quantity > 0 ? `${s.quantity} in stock` : "Out of stock"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No nearby pharmacy currently lists this medicine.
        </p>
      )}

      {med.alternative ? (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Cheaper generic alternative</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-foreground">
              <span className="font-medium">{med.alternative.name}</span>{" "}
              <span className="text-muted-foreground">({med.alternative.genericName})</span>
            </p>
            <p className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-emerald-600">
              <TrendingDown className="h-4 w-4" />
              {price(med.alternative.price)}
              <span className="text-xs font-normal text-muted-foreground">
                vs {price(med.price)}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
