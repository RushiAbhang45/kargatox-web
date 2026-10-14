"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "./gsap-registry";

// Classic GSAP ScrollTrigger "scroll-jacking" pattern: pin the viewport-height
// container, translate the wide flex track left by its own overflow as the
// user scrolls past it, so vertical scroll drives horizontal motion (the
// Schbang-style "Brand/Tech/Media Solution" panels). Respects
// prefers-reduced-motion by skipping the pin/scrub entirely and falling back
// to a plain horizontally-scrollable track (CLAUDE.md: animations must
// respect reduced-motion — this is the GSAP-side equivalent of
// MotionConfig's reducedMotion="user" used by the Framer Motion primitives).
export function HorizontalScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;

      const scrollLength = track.scrollWidth - container.offsetWidth;
      if (scrollLength <= 0) return;

      gsap.to(track, {
        x: -scrollLength,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollLength}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section className="px-6 py-[56px]">
      <div
        ref={containerRef}
        className={`mx-auto h-[300px] w-full max-w-(--width-site) overflow-hidden overflow-x-auto rounded-card border border-line motion-reduce:overflow-x-auto sm:h-[360px] ${className ?? ""}`}
      >
        <div ref={trackRef} className="flex h-full w-max">
          {children}
        </div>
      </div>
    </section>
  );
}
