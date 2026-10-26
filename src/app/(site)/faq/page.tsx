import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { FaqAccordion } from "./faq-accordion";
import { getPublishedPageContent } from "@/lib/page-content";
import { splitFirstSentence } from "@/lib/text-split";
import { getFaqItemsOrDefault } from "@/lib/services-content";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";

export const metadata: Metadata = {
  title: "FAQ — Kargatox",
  description: "You have questions. We have straight answers — what we do, how fast we start, and what it costs.",
};

export default async function FaqPage() {
  const content = await getPublishedPageContent("faq");
  const [headingPlain, headingAccent] = splitFirstSentence(content.heading);
  const faqItems = await getFaqItemsOrDefault();
  return (
    <main className="flex flex-1 flex-col">
      <section className="px-6 pb-[64px] pt-[56px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-16 gap-y-8">
          <div className="grid gap-3">
            <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">
              <ScrambleReveal text="BEFORE YOU ASK" />
            </div>
            <Reveal>
              <h1 className="font-display text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]">
                {headingPlain}
                {headingAccent && <span className="text-orange-500"> {headingAccent}</span>}
              </h1>
            </Reveal>
            <Link
              href="/contact"
              className="mt-2 w-fit rounded-pill bg-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-orange-500"
            >
              Ask us directly →
            </Link>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
