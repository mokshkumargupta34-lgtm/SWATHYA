"use client";

import * as React from "react";

/**
 * Returns whether the given media query currently matches.
 * SSR-safe: starts `false` on the server and syncs on mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * True when the user has asked the OS to minimize non-essential motion.
 * Use to skip confetti, heavy canvas/WebGL loops and auto-playing animation.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
