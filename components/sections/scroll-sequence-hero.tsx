"use client";

/**
 * ScrollSequenceHero — the site's signature scrollytelling mechanic.
 *
 * A full-viewport <canvas> is pinned (sticky) inside a tall section. As the
 * user scrolls, we compute a 0..1 progress and render the matching "frame".
 * Rather than loading a pre-rendered image sequence (hundreds of JPGs), each
 * frame is drawn procedurally from `progress` — the same scrubbing technique,
 * but resolution-independent and asset-free. Five scroll phases narrate the
 * five Sanjeevani focus areas.
 */

import * as React from "react";
import Link from "next/link";
import { MorphingText } from "@/components/ui/liquid-text";
import { FrameButton } from "@/components/ui/frame-button";

const MORPH_TEXTS = [
  "Sanjeevani",
  "स्वास्थ्य",
  "Health",
  "आरोग्य",
  "Wellness",
  "ஆரோக்கியம்",
  "Care",
  "স্বাস্থ্য",
];

const STAGES = [
  {
    tag: "01 · Last-mile reach",
    title: "Rural & remote healthcare",
    body: "A doctor a video-call away — even where the nearest clinic is hours of dusty road.",
  },
  {
    tag: "02 · Two lives at once",
    title: "Maternal & child health",
    body: "Track pregnancies, vaccinations and growth with gentle, timely nudges in your language.",
  },
  {
    tag: "03 · Minds matter",
    title: "Mental health for youth",
    body: "Private, stigma-free support and counsellors built for a younger generation.",
  },
  {
    tag: "04 · Within reach",
    title: "Medicine availability & affordability",
    body: "Find the nearest stock, compare prices and unlock generic alternatives that cost less.",
  },
  {
    tag: "05 · One portable record",
    title: "Records for mobile workers",
    body: "Carry your whole health history in your pocket — across cities, jobs and borders.",
  },
];

interface Node {
  angle: number;
  baseRadius: number;
  speed: number;
  size: number;
}

export function ScrollSequenceHero() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const targetProg = React.useRef(0);
  const smoothProg = React.useRef(0);
  const nodesRef = React.useRef<Node[]>([]);
  const [stageIdx, setStageIdx] = React.useState(0);

  // Build the converging node network once.
  if (nodesRef.current.length === 0) {
    const N = 16;
    nodesRef.current = Array.from({ length: N }, (_, i) => ({
      angle: (i / N) * Math.PI * 2,
      baseRadius: 0.9 + Math.random() * 0.25,
      speed: 0.15 + Math.random() * 0.25,
      size: 1.5 + Math.random() * 2.5,
    }));
  }

  // Scroll → progress.
  React.useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      targetProg.current = p;
      setStageIdx(Math.min(STAGES.length - 1, Math.floor(p * STAGES.length + 0.0001)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Canvas render loop.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let mounted = true;
    let visible = true;

    // Static gradients — rebuilt only on resize to avoid per-frame allocation.
    let bgGrad: CanvasGradient;
    let vignette: CanvasGradient;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;
      bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#02101a");
      bgGrad.addColorStop(0.6, "#04141d");
      bgGrad.addColorStop(1, "#031f1c");
      vignette = ctx.createRadialGradient(
        w / 2, h * 0.52, Math.min(w, h) * 0.3,
        w / 2, h * 0.52, Math.max(w, h) * 0.75,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause the loop entirely when the hero is scrolled out of view.
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    const ecg = (x: number) => {
      // A repeating heart-rate waveform, value in [-1, 1].
      const u = ((x % 1) + 1) % 1;
      if (u < 0.45) return Math.sin(u * Math.PI * 2) * 0.12;
      if (u < 0.5) return (u - 0.45) / 0.05;          // sharp rise
      if (u < 0.55) return 1 - (u - 0.5) / 0.05 * 1.6; // sharp drop
      if (u < 0.6) return -0.6 + (u - 0.55) / 0.05 * 0.6;
      return Math.sin(u * Math.PI * 2) * 0.05;
    };

    const draw = (p: number, t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h * 0.52;

      // Background wash (cached gradient).
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Central breathing glow, intensifies with progress.
      const glowR = Math.min(w, h) * (0.28 + p * 0.55) * (1 + 0.05 * Math.sin(t * 1.6));
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      rg.addColorStop(0, `rgba(34,211,238,${0.22 + 0.22 * p})`);
      rg.addColorStop(0.45, `rgba(8,145,178,${0.14})`);
      rg.addColorStop(0.75, `rgba(5,150,105,${0.08})`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);

      // Expanding heartbeat rings.
      const rings = 4;
      for (let i = 0; i < rings; i++) {
        const phase = (t * 0.25 + i / rings) % 1;
        const r = phase * Math.min(w, h) * 0.6 * (0.6 + p * 0.8);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,211,238,${(1 - phase) * 0.12})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Converging node network (the "care mesh").
      const nodes = nodesRef.current;
      const baseR = Math.min(w, h) * (0.42 - p * 0.16);
      const pts = nodes.map((n) => {
        const a = n.angle + t * n.speed * 0.3;
        const r = baseR * n.baseRadius * (1 + 0.05 * Math.sin(t * 1.2 + n.angle));
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.78, s: n.size };
      });
      // links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          const maxD = 150 + p * 120;
          if (d < maxD) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(125,224,212,${(1 - d / maxD) * 0.22 * (0.4 + p)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      // nodes
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(34,211,238,0.7)";
      for (const pt of pts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(190,247,255,0.9)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ECG heartbeat line, "drawn" up to progress.
      const baseY = h * 0.5;
      const amp = h * (0.06 + p * 0.05);
      const span = 3.2;            // waveform cycles across the screen
      const drawn = 0.15 + p * 0.85; // fraction of width revealed
      const scroll = t * 0.18;
      ctx.beginPath();
      let started = false;
      for (let px = 0; px <= w * drawn; px += 2) {
        const u = (px / w) * span + scroll;
        const y = baseY - ecg(u) * amp;
        if (!started) {
          ctx.moveTo(px, y);
          started = true;
        } else {
          ctx.lineTo(px, y);
        }
      }
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      lineGrad.addColorStop(0, "rgba(8,145,178,0.1)");
      lineGrad.addColorStop(0.5, "rgba(34,211,238,0.95)");
      lineGrad.addColorStop(1, "rgba(16,222,165,0.95)");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2.4;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(16,222,165,0.8)";
      ctx.stroke();
      // leading pulse dot
      const headX = w * drawn;
      const headY = baseY - ecg((headX / w) * span + scroll) * amp;
      ctx.beginPath();
      ctx.arc(headX, headY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#a7ffe9";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Vignette (cached gradient).
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const render = (ts: number) => {
      smoothProg.current += (targetProg.current - smoothProg.current) * 0.08;
      if (visible && !document.hidden) draw(smoothProg.current, ts * 0.001);
      if (mounted) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const stage = STAGES[stageIdx];

  return (
    <section ref={wrapRef} className="relative h-[420vh] bg-[#02101a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        {/* Overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-cyan-200/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Health · Wellness · Care Access
          </span>

          {/* The single page <h1>; the morphing text below is decorative. */}
          <h1 className="sr-only">
            Sanjeevani — Health, Wellness and Care Access
          </h1>
          <MorphingText
            texts={MORPH_TEXTS}
            decorative
            className="!h-20 text-white md:!h-28 [&_span]:!text-white"
          />

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Bringing healthcare closer in{" "}
            <span className="text-cyan-300">distance</span>,{" "}
            <span className="text-emerald-300">cost</span> and{" "}
            <span className="text-cyan-200">language</span>.
          </p>

          {/* Scroll-synced stage caption */}
          <div
            key={stageIdx}
            className="mt-10 h-24 max-w-xl animate-fade-in-up"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
              {stage.tag}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white md:text-3xl">
              {stage.title}
            </h2>
            <p className="mt-2 text-sm text-white/55 md:text-base">{stage.body}</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link href="/signup" className="no-underline">
              <FrameButton as="button" variant="default" glow>
                Get Care Now
              </FrameButton>
            </Link>
            <Link href="/pricing" className="no-underline">
              <FrameButton as="button" variant="outline">
                See Plans
              </FrameButton>
            </Link>
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {STAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === stageIdx ? "w-8 bg-cyan-300" : "w-3 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
