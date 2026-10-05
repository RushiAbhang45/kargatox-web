import type { Metadata } from "next";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { PROCESS_STEPS } from "@/lib/process-steps";

export const metadata: Metadata = {
  title: "How we work — Kargatox",
  description: "Here is exactly what happens after you say yes: five steps from discovery to handover.",
};

export default function HowWeWorkPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="kx-float-alt absolute -left-[200px] -bottom-[280px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(242,106,27,0.3),rgba(242,106,27,0)_70%)]" />
        <div className="relative mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-20 gap-y-10 px-6 pb-[100px] pt-[100px]">
          <div>
            <div className="font-mono text-[13px] tracking-[0.12em] text-orange-400">HOW WE WORK</div>
            <Reveal delay={0.1}>
              <h1 className="mt-5 font-display text-[clamp(44px,6vw,88px)] font-semibold leading-[0.98] tracking-[-0.02em]">
                We do the work.
                <br />
                <span className="text-blue-300">You keep the system.</span>
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
              <p className="mt-[18px] rounded-[14px] border border-orange-400/35 bg-orange-500/14 px-5 py-[18px] text-[17px] leading-[1.6] text-white">
                <strong className="text-orange-400">Straight up:</strong> If we are not the right fix for
                your problem, we will tell you on the first call.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 pb-[120px] pt-[100px]">
        <RevealGroup className="mx-auto grid max-w-[1000px]">
          {PROCESS_STEPS.map((s) => (
            <div key={s.num} className="grid grid-cols-[auto_minmax(0,1fr)] gap-7 border-t border-line-2 py-10">
              <div className="min-w-[1.4em] font-display text-[clamp(48px,6vw,80px)] font-semibold leading-[0.9] text-orange-500">
                {s.num}
              </div>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h2 className="font-display text-[clamp(26px,3vw,36px)] font-semibold tracking-[-0.02em]">
                    {s.title}
                  </h2>
                  <span className="whitespace-nowrap rounded-pill bg-chip-blue px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-blue-600">
                    {s.when}
                  </span>
                </div>
                <p className="max-w-[680px] text-[18px] leading-[1.65] text-slate">{s.body}</p>
              </div>
            </div>
          ))}
        </RevealGroup>
      </section>

      <SiteFooter />
    </main>
  );
}
