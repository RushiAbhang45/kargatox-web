import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { NumberedRows } from "@/components/numbered-rows";
import { SiteFooter } from "@/components/site-footer";
import { PROCESS_STEPS } from "@/lib/process-steps";

export const metadata: Metadata = {
  title: "How we work — Kargatox",
  description: "Here is exactly what happens after you say yes: five steps from discovery to handover.",
};

export default function HowWeWorkPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-20 gap-y-10 px-6 pb-[100px] pt-[100px]">
          <div>
            <div className="font-mono text-[13px] tracking-[0.12em] text-blue-300">HOW WE WORK</div>
            <Reveal delay={0.1}>
              <h1 className="mt-5 font-display text-[clamp(36px,4.6vw,68px)] font-semibold leading-[1.02] tracking-[-0.02em]">
                We do the work.
                <br />
                <span className="text-white/70">You keep the system.</span>
              </h1>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <p className="text-xl leading-[1.6] text-mist">
                Here is exactly what happens after you say yes.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-[18px] rounded-input border border-orange-400/35 bg-orange-500/14 px-5 py-[18px] text-[17px] leading-[1.6] text-white">
                <strong className="text-orange-400">Straight up:</strong> If we are not the right fix for
                your problem, we will tell you on the first call.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 pb-[120px] pt-[100px]">
        <NumberedRows
          className="mx-auto grid max-w-[1000px]"
          variant="full"
          theme="light"
          items={PROCESS_STEPS.map((s) => ({ ...s, meta: s.when }))}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
