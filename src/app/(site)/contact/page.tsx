import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "./contact-form";
import { getPublishedPageContent } from "@/lib/page-content";
import { splitLastWord } from "@/lib/text-split";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";

export const metadata: Metadata = {
  title: "Contact — Kargatox",
  description:
    "Connect with the Kargatox team to discuss your research, data structuring, or lead generation requirements.",
};

const STEPS = [
  {
    num: "01",
    title: "Discovery Call",
    body: "A brief technical discussion to align on your data needs and current workflow gaps.",
  },
  {
    num: "02",
    title: "Scope Definition",
    body: "We outline the specific deliverables, methodologies, and timeline.",
  },
];

export default async function ContactPage() {
  const content = await getPublishedPageContent("contact");
  const [headingPlain, headingAccent] = splitLastWord(content.heading);
  return (
    <main className="flex flex-1 flex-col bg-ink text-white">
      <section className="px-6 pb-[64px] pt-[56px]">
        <div className="relative mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-12 gap-y-8">
          <div className="grid gap-4">
            <div className="font-mono text-[12px] tracking-[0.14em] text-orange-400">
              <ScrambleReveal text="GET IN TOUCH" />
            </div>
            <Reveal>
              <h1 className="font-display text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.08] tracking-[-0.02em]">
                {headingPlain} <span className="text-orange-400">{headingAccent}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[440px] text-[15px] leading-[1.6] text-mist">{content.intro}</p>
            </Reveal>

            <RevealGroup className="mt-3 grid gap-4" itemClassName="grid grid-cols-[32px_minmax(0,1fr)] gap-x-2.5 gap-y-1.5">
              {STEPS.map((s) => (
                <div key={s.num} className="contents">
                  <span className="pt-[3px] font-mono text-[13px] text-orange-400">{s.num}</span>
                  <div>
                    <h3 className="text-[15px] font-bold">{s.title}</h3>
                    <p className="mt-1 text-[13px] leading-[1.6] text-mist-2">{s.body}</p>
                  </div>
                </div>
              ))}
            </RevealGroup>

            <div className="mt-3 grid gap-1 border-t border-white/10 pt-4">
              <span className="font-mono text-[11px] tracking-[0.12em] text-mist-2">PREFER EMAIL?</span>
              <a
                href="mailto:hello@kargatox.com"
                className="font-display text-[17px] font-bold text-white transition-colors hover:text-orange-400"
              >
                hello@kargatox.com
              </a>
            </div>
          </div>

          <Suspense fallback={<div className="h-[380px] rounded-panel border border-white/10 bg-navy-800" />}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
      <SiteFooter showCta={false} />
    </main>
  );
}
