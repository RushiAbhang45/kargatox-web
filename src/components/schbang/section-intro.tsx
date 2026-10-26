import { ScrambleReveal } from "@/components/gsap/scramble-reveal";

// Shared "eyebrow + big headline, giant arrow glyph + CTA" row — Schbang
// reuses this motif across several sections (its "What defines us" block,
// its FAQ-adjacent sections). Reusing it here too, rather than one-off
// flex-rows per section, is what makes this read as an actual layout system
// instead of recolored copies of the original components. The eyebrow always
// scrambles in on scroll (src/components/gsap/scramble-reveal.tsx) — applying
// that consistently across sections, not just the hero, is what makes it read
// as a real system instead of a one-off hero flourish.
export function SectionIntro({
  eyebrow,
  title,
  cta,
  arrow = "left",
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  cta?: React.ReactNode;
  arrow?: "left" | "right";
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div>
        <div className={`font-mono text-[12px] tracking-[0.12em] ${dark ? "text-orange-400" : "text-orange-500"}`}>
          <ScrambleReveal text={eyebrow} />
        </div>
        <h2 className="mt-2.5 max-w-[560px] font-display text-[clamp(24px,3.2vw,40px)] font-bold leading-[1.08] tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      {(cta || arrow) && (
        <div className="flex items-center gap-5">
          <span
            aria-hidden="true"
            className={`hidden text-[34px] leading-none font-black md:block ${dark ? "text-white" : "text-ink"}`}
          >
            {arrow === "left" ? "←" : "→"}
          </span>
          {cta}
        </div>
      )}
    </div>
  );
}
