"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/ui/animated-shader-hero";
import { useStaticVisuals } from "@/hooks/use-lite-mode";

function StaticShaderCta({ onGetCare, onPlans }: { onGetCare: () => void; onPlans: () => void }) {
  return (
    <section className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#02101a] to-[#04303a] px-4 text-center text-white">
      <div className="mb-8 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-6 py-3 text-sm text-cyan-100">
        Trusted across 94 villages and 1,200+ health workers
      </div>
      <h2 className="font-heading text-5xl font-bold md:text-7xl">
        <span className="block bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
          Healthcare,
        </span>
        <span className="block bg-gradient-to-r from-emerald-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
          Closer to Home
        </span>
      </h2>
      <p className="mt-6 max-w-3xl text-lg text-cyan-50/85 md:text-xl">
        Reach a doctor, carry your records and find affordable medicine — in your
        own language. Care that travels the last mile, so no one is left behind.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onGetCare}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500 px-8 py-4 text-lg font-semibold text-[#03141a] transition-transform hover:scale-105"
        >
          Get Care Now
        </button>
        <button
          onClick={onPlans}
          className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-8 py-4 text-lg font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
        >
          Compare Plans
        </button>
      </div>
    </section>
  );
}

export function ShaderCta() {
  const router = useRouter();
  const staticVisuals = useStaticVisuals();

  if (staticVisuals) {
    return (
      <StaticShaderCta
        onGetCare={() => router.push("/signup")}
        onPlans={() => router.push("/pricing")}
      />
    );
  }

  return (
    <section className="relative">
      <Hero
        trustBadge={{
          text: "Trusted across 94 villages and 1,200+ health workers",
          icons: ["✦"],
        }}
        headline={{
          line1: "Healthcare,",
          line2: "Closer to Home",
        }}
        subtitle="Reach a doctor, carry your records and find affordable medicine — in your own language. Care that travels the last mile, so no one is left behind."
        buttons={{
          primary: {
            text: "Get Care Now",
            onClick: () => router.push("/signup"),
          },
          secondary: {
            text: "Compare Plans",
            onClick: () => router.push("/pricing"),
          },
        }}
      />
    </section>
  );
}
