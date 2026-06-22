"use client";

import dynamic from "next/dynamic";

interface AnomalousSectionProps {
  title: string;
  subtitle: string;
  description: string;
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
  return <AnomalousMatterHero {...props} />;
}
