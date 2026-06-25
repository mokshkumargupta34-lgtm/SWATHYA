"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Baby, Brain, Pill, FileHeart } from "lucide-react";

const AREAS = [
  {
    icon: Stethoscope,
    title: "Rural & Remote Healthcare",
    body: "Tele-consults, ASHA-worker tools and offline-first records reach the last village on the map.",
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconBg: "bg-cyan-500/15 text-cyan-600",
    span: "md:col-span-2",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    body: "Pregnancy tracking, vaccination reminders and growth monitoring for two lives at once.",
    accent: "from-emerald-500/20 to-emerald-500/0",
    iconBg: "bg-emerald-500/15 text-emerald-600",
    span: "",
  },
  {
    icon: Brain,
    title: "Mental Health for Youth",
    body: "Private, stigma-free check-ins and counsellors designed for a younger generation.",
    accent: "from-teal-500/20 to-teal-500/0",
    iconBg: "bg-teal-500/15 text-teal-600",
    span: "",
  },
  {
    icon: Pill,
    title: "Medicine Availability & Affordability",
    body: "Live stock at nearby pharmacies, price comparison and cheaper generic alternatives.",
    accent: "from-sky-500/20 to-sky-500/0",
    iconBg: "bg-sky-500/15 text-sky-600",
    span: "md:col-span-2",
  },
];

const fade = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function FocusAreas() {
  return (
    <section id="focus" className="relative bg-background py-24 md:py-32">
      {/* Fade the dark scroll hero above into this light section (behind content). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-[#02101a] to-transparent md:h-48"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Five fronts, one mission
          </span>
          <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Care that meets people where they are
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            SWASTHYA closes the gaps that keep healthcare out of reach — across
            distance, cost and language.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {AREAS.map((a, i) => (
            <motion.article
              key={a.title}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${a.span}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconBg}`}>
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">
                  {a.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {a.body}
                </p>
              </div>
            </motion.article>
          ))}

          {/* Fifth area — wide highlight card */}
          <motion.article
            custom={4}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="group relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary to-emerald-600 p-7 text-primary-foreground shadow-lg md:col-span-3"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <FileHeart className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-heading text-xl font-semibold">
              Health Records for Mobile Workers
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              One portable, secure record that travels with you across cities,
              jobs and borders.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
