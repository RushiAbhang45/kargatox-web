import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { FaqAccordion } from "./faq-accordion";

export const metadata: Metadata = {
  title: "FAQ — Kargatox",
  description: "You have questions. We have straight answers — what we do, how fast we start, and what it costs.",
};

export default function FaqPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="px-6 pb-[120px] pt-[110px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-20 gap-y-12">
          <div className="grid gap-[18px]">
            <div className="font-mono text-[13px] tracking-[0.12em] text-blue-600">BEFORE YOU ASK</div>
            <Reveal>
              <h1 className="font-display text-[clamp(32px,4vw,52px)] font-semibold leading-[1.1] tracking-[-0.02em]">
                You have questions. <span className="text-blue-600">We have straight answers.</span>
              </h1>
            </Reveal>
            <Link
              href="/contact"
              className="mt-3 w-fit rounded-pill bg-navy-900 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy-700"
            >
              Ask us directly →
            </Link>
          </div>
          <FaqAccordion />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
