"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "./gsap-registry";

// Schbang's nav-label effect, generalized: scrambles from random characters
// into the real text once the element scrolls into view. Falls back to
// plain static text under prefers-reduced-motion (see horizontal-scroll-
// section.tsx for why that matters here).
export function ScrambleReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el, {
        duration: 1,
        scrambleText: { text, chars: "upperAndLowerCase", revealDelay: 0.2, speed: 0.4 },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [text] }
  );

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
