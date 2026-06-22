import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PricingSection } from "@/components/sections/pricing-section";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-12 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Pricing
        </span>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Affordable by design
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Care should never be a luxury. Start free, upgrade only when your
          family or community needs more.
        </p>
      </div>

      {/* Heading lives in the page hero above; suppress the section's own header. */}
      <PricingSection title="" description="" />

      <CinematicFooter />
    </main>
  );
}
