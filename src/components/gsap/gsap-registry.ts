"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// ScrollTrigger/ScrambleTextPlugin (and SplitText, unused here) have been
// free since Webflow's 2024 GreenSock acquisition — no Club GreenSock
// license needed. Registered once, module-level, so every importer shares
// the same registration instead of re-registering per component.
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
