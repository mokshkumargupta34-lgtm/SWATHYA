"use client";

import * as React from "react";
import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero";

const STATS = [
  { k: "8", v: "Languages supported" },
  { k: "Free", v: "Individual plan" },
  { k: "Offline", v: "Low-bandwidth ready" },
  { k: "Secure", v: "Encrypted records" },
];

export function ReachSection() {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-black">
      <AntiGravityCanvas />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-white/60 backdrop-blur-sm">
          Move your cursor — the mesh responds
        </span>
        <h2 className="max-w-4xl font-heading text-4xl font-bold tracking-tight text-white md:text-6xl">
          A living network that carries care{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            across the last mile
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base text-white/55 md:text-lg">
          Every node is a health worker, clinic or family — woven together so no
          one is out of reach.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-12">
          {STATS.map((s) => (
            <div key={s.v}>
              <p className="font-heading text-3xl font-bold text-white md:text-5xl">
                {s.k}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/45 md:text-sm">
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
