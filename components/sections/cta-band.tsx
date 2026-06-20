"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClickPowerUp } from "@/components/ui/click-powerup";
import { FrameButton } from "@/components/ui/frame-button";

export function CtaBand() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-[#03141a] py-28 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">
          Healthcare closer to home
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
          Join SWASTHYA today — get care, carry your records, and reach a doctor
          in your own language.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <div onClick={() => router.push("/login")}>
            <ClickPowerUp className="text-white">Get Care Now</ClickPowerUp>
          </div>
          <FrameButton
            as="link"
            href="/pricing"
            variant="outline"
            className="text-white! border-white/40!"
          >
            Compare Plans
          </FrameButton>
        </div>
      </div>
    </section>
  );
}
