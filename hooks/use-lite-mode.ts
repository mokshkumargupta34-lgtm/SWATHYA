"use client";

import * as React from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const LITE_KEY = "swasthya:lite";

/**
 * Low-bandwidth "Lite mode". When on, the heavy WebGL/three.js/particle
 * scenes are replaced by static posters so the site stays light on weak
 * connections and low-power devices — central to SWASTHYA's mission.
 *
 * The `.lite` class is applied to <html> before paint (see app/layout.tsx)
 * and the choice is persisted to localStorage.
 */
export function useLiteMode(): boolean {
  const [lite, setLite] = React.useState(false);

  React.useEffect(() => {
    setLite(document.documentElement.classList.contains("lite"));
    const onChange = () =>
      setLite(document.documentElement.classList.contains("lite"));
    window.addEventListener("swasthya:lite-change", onChange);
    return () => window.removeEventListener("swasthya:lite-change", onChange);
  }, []);

  return lite;
}

export function setLiteMode(on: boolean): void {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("lite", on);
  try {
    window.localStorage.setItem(LITE_KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event("swasthya:lite-change"));
}

/**
 * True when heavy motion/graphics should be skipped — either because the
 * user enabled Lite mode or asked the OS to reduce motion.
 */
export function useStaticVisuals(): boolean {
  const lite = useLiteMode();
  const reduced = usePrefersReducedMotion();
  return lite || reduced;
}
