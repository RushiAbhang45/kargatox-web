import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { NumberedRows } from "@/components/numbered-rows";
import { SiteFooter } from "@/components/site-footer";
import { PROCESS_STEPS } from "@/lib/process-steps";
import { getPublishedPageContent } from "@/lib/page-content";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";

export const metadata: Metadata = {
  title: "How we work — Kargatox",
  description: "Here is exactly what happens after you say yes: five steps from discovery to handover.",
};

export default async function HowWeWorkPage() {
  const content = await getPublishedPageContent("how-we-work");
  // Admin-editable as "first line\nsecond line" (see src/lib/page-content-defaults.ts) —
  // falls back to a single line if no newline was entered.
  const [headlineLine1, headlineLine2] = content.headline.split("\n");
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-white text-ink">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-end gap-x-14 gap-y-6 px-6 pb-[48px] pt-[56px]">
          <div>
            <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">
              <ScrambleReveal text="HOW WE WORK" />
            </div>
            <Reveal delay={0.1}>
              <h1 className="mt-3 font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08] tracking-[-0.02em]">
                {headlineLine1}
                {headlineLine2 && (
                  <>
                    <br />
                    <span className="text-slate">{headlineLine2}</span>
                  </>
                )}
              </h1>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <p className="text-[15px] leading-[1.6] text-slate">{content.subline}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 rounded-input border border-orange-400/35 bg-orange-500/8 px-4 py-3 text-[14px] leading-[1.6] text-ink">
                <strong className="text-orange-500">Straight up:</strong> {content.straightUpNote}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 pb-[64px] pt-[40px]">
        <NumberedRows
          className="mx-auto grid max-w-[820px]"
          variant="full"
          theme="light"
          items={PROCESS_STEPS.map((s) => ({ ...s, meta: s.when }))}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
