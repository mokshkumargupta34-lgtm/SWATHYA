"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/ui/animated-shader-hero";

export function ShaderCta() {
  const router = useRouter();

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
