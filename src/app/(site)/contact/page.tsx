import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "./contact-form";

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

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col bg-navy-900 text-white">
      <section className="px-6 pb-[120px] pt-[90px]">
        <div className="relative mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-18 gap-y-14">
          <div className="grid gap-6">
            <div className="font-mono text-[13px] tracking-[0.14em] text-orange-400">GET IN TOUCH</div>
            <Reveal>
              <h1 className="font-display text-[clamp(36px,4.4vw,60px)] font-semibold leading-[1.02] tracking-[-0.02em]">
                Initiate a <span className="text-orange-400">Project</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[520px] text-[19px] leading-[1.6] text-mist">
                Connect with our team to discuss your specific research, data structuring, or lead
                generation requirements. We will review your scope and provide a structured proposal.
              </p>
            </Reveal>

            <RevealGroup className="mt-6 grid gap-7" itemClassName="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-2">
              {STEPS.map((s) => (
                <div key={s.num} className="contents">
                  <span className="pt-[3px] font-mono text-sm text-orange-400">{s.num}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-base leading-[1.6] text-mist-2">{s.body}</p>
                  </div>
                </div>
              ))}
            </RevealGroup>

            <div className="mt-5 grid gap-1.5 border-t border-white/10 pt-6">
              <span className="font-mono text-xs tracking-[0.12em] text-mist-2">PREFER EMAIL?</span>
              <a
                href="mailto:hello@kargatox.com"
                className="font-display text-2xl font-semibold text-white transition-colors hover:text-orange-400"
              >
                hello@kargatox.com
              </a>
            </div>
          </div>

          <Suspense
            fallback={<div className="h-[520px] rounded-panel border border-white/10 bg-navy-800" />}
          >
            <ContactForm />
          </Suspense>
        </div>
      </section>
      <SiteFooter showCta={false} />
    </main>
  );
}
