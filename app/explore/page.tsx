"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Component as HorizonHero } from "@/components/ui/horizon-hero-section";

export default function ExplorePage() {
  return (
    <main className="relative bg-black">
      <Link
        href="/app"
        className="fixed left-5 top-5 z-50 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <HorizonHero />
    </main>
  );
}
