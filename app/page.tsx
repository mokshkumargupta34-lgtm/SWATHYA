import { SiteNav } from "@/components/sections/site-nav";
import { ScrollSequenceHero } from "@/components/sections/scroll-sequence-hero";
import { FocusAreas } from "@/components/sections/focus-areas";
import { AnomalousSection } from "@/components/sections/anomalous-section";
import { PlatformReveal } from "@/components/sections/platform-reveal";
import { ReachSection } from "@/components/sections/reach-section";
import { Roadmap } from "@/components/sections/roadmap";
import { PricingSection } from "@/components/sections/pricing-section";
import { ShaderCta } from "@/components/sections/shader-cta";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <SiteNav />

      {/* Core scrollytelling mechanic: scroll-scrubbed canvas sequence */}
      <ScrollSequenceHero />

      {/* The five focus areas */}
      <FocusAreas />

      {/* Mental health — immersive three.js anomaly (lazy-loaded) */}
      <AnomalousSection
        title="03 · Mental health for youth"
        subtitle="A calm space to be heard"
        description="Anonymous check-ins, mood tracking and counsellors who understand a younger generation — because minds deserve care too."
      />

      {/* Platform dashboard reveal on scroll */}
      <PlatformReveal />

      {/* Interactive reach / network */}
      <ReachSection />

      {/* What's live now vs on the roadmap */}
      <Roadmap />

      {/* Pricing */}
      <PricingSection />

      {/* Final CTA — animated WebGL shader hero */}
      <ShaderCta />

      {/* Cinematic curtain footer */}
      <CinematicFooter />
    </main>
  );
}
