"use client";

import * as React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Activity, CalendarClock, MapPin, ShieldCheck, Users } from "lucide-react";

function MiniDashboard() {
  return (
    <div className="flex h-full w-full flex-col gap-3 bg-gradient-to-br from-[#06141c] to-[#072019] p-4 text-white md:gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-white/70 md:text-sm">
            SWASTHYA · Care Console
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Users, k: "12,480", v: "Patients reached", c: "text-cyan-300" },
          { icon: CalendarClock, k: "318", v: "Consults today", c: "text-emerald-300" },
          { icon: MapPin, k: "94", v: "Villages live", c: "text-teal-300" },
          { icon: ShieldCheck, k: "100%", v: "Records secured", c: "text-sky-300" },
        ].map((s) => (
          <div
            key={s.v}
            className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
          >
            <s.icon className={`h-4 w-4 ${s.c}`} />
            <p className="mt-2 text-lg font-bold md:text-2xl">{s.k}</p>
            <p className="text-[10px] text-white/50 md:text-xs">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid flex-[2] grid-cols-1 gap-3 md:grid-cols-3">
        <div className="col-span-1 rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Activity className="h-4 w-4 text-emerald-300" /> Weekly consultations
          </div>
          <div className="mt-4 flex h-28 items-end gap-1.5 md:h-40">
            {[40, 62, 48, 80, 55, 92, 70, 88, 60, 96, 74, 82].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-emerald-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/60">Care queue</p>
          <ul className="mt-3 space-y-2.5">
            {["Maternal check-up", "Tele-psychiatry", "Medicine refill"].map((t, i) => (
              <li key={t} className="flex items-center gap-2 text-xs text-white/80">
                <span
                  className={`h-2 w-2 rounded-full ${
                    ["bg-emerald-400", "bg-cyan-400", "bg-sky-400"][i]
                  }`}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PlatformReveal() {
  return (
    <section id="platform" className="relative -mt-20 bg-background">
      <ContainerScroll
        titleComponent={
          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              One platform
            </span>
            <h2 className="mt-3 font-heading text-4xl font-bold text-foreground md:text-6xl">
              Your whole health system <br />
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                in a single console
              </span>
            </h2>
          </div>
        }
      >
        <MiniDashboard />
      </ContainerScroll>
    </section>
  );
}
