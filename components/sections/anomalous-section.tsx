"use client";

import dynamic from "next/dynamic";
import { useStaticVisuals } from "@/hooks/use-lite-mode";

interface AnomalousSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

/** Static, GPU-free rendering used in Lite / reduced-motion mode. */
function StaticAnomalous({ title, subtitle, description }: AnomalousSectionProps) {
  return (
    <section
      aria-label="Youth mental health"
      className="relative w-full overflow-hidden bg-[#04070d] py-32 text-foreground"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-mono tracking-widest text-sky-400/80 uppercase">
          {title}
        </p>
        <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
          {subtitle}
        </h2>
        <p className="mt-6 mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}

/**
 * Static poster shown while the three.js bundle streams in. Matches the
 * scene's dark backdrop and reserves the full-viewport height so there's no
 * layout shift when the real canvas mounts.
 */
function ScenePoster() {
  return (
    <div
      aria-hidden="true"
      className="relative h-screen w-full overflow-hidden bg-[#04070d]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}

// Defer three.js (~heavy) to a client-only chunk so it never bloats the
// initial route JS — important for the low-bandwidth audience.
const AnomalousMatterHero = dynamic(
  () =>
    import("@/components/ui/anomalous-matter-hero").then(
      (m) => m.AnomalousMatterHero,
    ),
  { ssr: false, loading: () => <ScenePoster /> },
);

export function AnomalousSection(props: AnomalousSectionProps) {
  const staticVisuals = useStaticVisuals();
  if (staticVisuals) return <StaticAnomalous {...props} />;
  return <AnomalousMatterHero {...props} />;
}
