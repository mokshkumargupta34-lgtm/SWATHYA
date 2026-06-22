"use client";

import * as React from "react";
import { MapPin, Pill, Search, Sparkles, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, type MedicineResult } from "@/lib/client-api";
import {
  ErrorNote,
  PageContainer,
  PageHeading,
  SectionCard,
  Spinner,
} from "@/components/app/primitives";

function price(n: number) {
  return n === 0 ? "Free" : `₹${n}`;
}

export default function MedicinesPage() {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<MedicineResult[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
        subtitle="Live stock at nearby pharmacies — with cheaper generic alternatives."
      />

      <SectionCard>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
            <MedicineCard key={m.id} med={m} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function MedicineCard({ med }: { med: MedicineResult }) {
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

      {med.stock.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {med.stock.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.pharmacy}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.village} · {s.distanceKm} km
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{price(s.price)}</p>
                <p
                  className={cn(
                    "text-[11px] font-medium",
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
              <span className="text-muted-foreground">
                ({med.alternative.genericName})
              </span>
            </p>
            <p className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
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
