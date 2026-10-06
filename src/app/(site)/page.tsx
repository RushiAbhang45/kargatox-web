import Link from "next/link";
import { Reveal, RevealGroup, RiseWords } from "@/components/motion/reveal";
import { NumberedRows } from "@/components/numbered-rows";
import { RevenueCheck } from "@/components/home/revenue-check";
import { SiteFooter } from "@/components/site-footer";
import { PROCESS_STEPS } from "@/lib/process-steps";

const PILLARS = [
  {
    num: "01",
    title: "Founder-Led",
    body: "Started and run by people who've built businesses themselves — not advisors reciting a framework.",
  },
  {
    num: "02",
    title: "In The Weeds",
    body: "We sit inside your CRM, your campaigns and your calls. The work happens with your team, not around it.",
  },
  {
    num: "03",
    title: "Numbers First",
    body: "Every engagement is scoped against a number that needs to move: pipeline, retention, revenue. Not a deck.",
  },
];

const CAPABILITY_SERVICES = [
  {
    num: "01",
    title: "Research Services",
    subs: ["Market Research", "Consumer Behaviour & Satisfaction Analysis", "Campaign Analytics"],
  },
  {
    num: "02",
    title: "Marketing Services",
    subs: ["SEO Services", "Social Media Marketing", "Brand Campaigns Strategy"],
  },
];

const TICKER = [...CAPABILITY_SERVICES.flatMap((s) => s.subs), ...CAPABILITY_SERVICES.flatMap((s) => s.subs)];

const HERO_WORDS = [
  { text: "Built" },
  { text: "On" },
  { text: "Research." },
  { text: "Measured" },
  { text: "In" },
  { text: "Growth.", className: "text-blue-300" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="kx-float absolute -right-[140px] -top-[120px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(47,108,240,0.35),rgba(47,108,240,0)_70%)]" />
        <div className="relative mx-auto grid max-w-(--width-site) grid-cols-1 gap-y-14 px-6 pb-[90px] pt-[110px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-x-16">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-chip border border-white/16 px-3.5 py-[7px] font-mono text-xs uppercase tracking-[0.08em] text-mist">
              <span className="h-[7px] w-[7px] rounded-full bg-blue-300" />
              Strategy · Research · Growth
            </div>
            <h1 className="mt-7 max-w-[720px] font-display text-[clamp(38px,6vw,84px)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <RiseWords words={HERO_WORDS} />
            </h1>
            <Reveal delay={0.3}>
              <p className="mt-7 max-w-[560px] text-[clamp(17px,1.6vw,21px)] leading-[1.6] text-mist">
                We help founders and leadership teams understand their market, decode their customers, and turn
                that insight into campaigns that move revenue — across India
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-10 flex flex-wrap gap-3.5">
                <Link
                  href="/contact"
                  className="rounded-pill bg-blue-500 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Start an Inquiry →
                </Link>
                <Link
                  href="/services"
                  className="rounded-input border border-white/25 px-7 py-4 text-base font-semibold text-white transition-colors hover:border-blue-300"
                >
                  Explore services
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="lg:pt-[18px]">
            <NumberedRows items={PILLARS} variant="tight" theme="dark" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-t border-white/8 bg-navy-900 py-[26px]">
        <div className="kx-marquee-track flex w-max">
          {[...TICKER, ...TICKER].map((label, i) => (
            <span
              key={i}
              className="flex items-center gap-7 whitespace-nowrap pr-7 font-display text-[clamp(24px,3vw,40px)] font-semibold tracking-[-0.01em] text-white"
            >
              <span className={`h-3 w-3 rounded-[3px] ${i % 2 ? "bg-white" : "bg-blue-500"}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="px-6 py-[120px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-20 gap-y-12">
          <div>
            <div className="font-mono text-[13px] tracking-[0.12em] text-blue-600">OUR CAPABILITIES</div>
            <h2 className="mt-[18px] font-display text-[clamp(36px,4.6vw,64px)] font-semibold leading-[1.02] tracking-[-0.032em]">
              Two Disciplines.{" "}
              <span className="text-blue-600">One Growth Engine.</span>
            </h2>
          </div>
          <p className="text-[19px] leading-[1.6] text-slate">
            Kargatox runs on two disciplines working together: research that tells you who your market
            actually is, and marketing built to reach them. We find the gap, design the fix, and stay close
            enough to the data to know it&apos;s working.
          </p>
        </div>
        <RevealGroup className="mx-auto mt-16 grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-5">
          {CAPABILITY_SERVICES.map((s) => (
            <Link
              key={s.num}
              href="/services"
              className="group flex flex-col gap-[18px] rounded-card border border-line bg-white p-9 text-ink transition-colors duration-500 ease-[var(--ease-kx)] hover:border-blue-500 hover:bg-paper"
            >
              <div className="font-mono text-[13px] text-blue-600">{s.num}</div>
              <h3 className="font-display text-[34px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              <div className="flex flex-wrap gap-2">
                {s.subs.map((sub) => (
                  <span key={sub} className="rounded-chip bg-chip-cool px-3.5 py-2 text-sm font-medium text-[#262626]">
                    {sub}
                  </span>
                ))}
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-[15px] font-semibold text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
                View details →
              </span>
            </Link>
          ))}
        </RevealGroup>
      </section>

      <RevenueCheck />

      <section className="bg-navy-900 px-6 py-[110px] text-white">
        <div className="mx-auto max-w-(--width-site)">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[13px] tracking-[0.12em] text-blue-300">HOW WE WORK</div>
              <h2 className="mt-[18px] font-display text-[clamp(38px,4.6vw,64px)] font-semibold leading-none tracking-[-0.032em]">
                We do the work.
                <br />
                <span className="text-white/70">You keep the system.</span>
              </h2>
            </div>
            <Link
              href="/how-we-work"
              className="whitespace-nowrap rounded-input border border-white/25 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-blue-300"
            >
              See the full process →
            </Link>
          </div>
          <NumberedRows
            className="mt-10"
            variant="compact"
            theme="dark"
            items={PROCESS_STEPS.slice(0, 3).map((s) => ({ ...s, meta: s.when }))}
          />
        </div>
      </section>

      <section className="px-6 py-[110px]">
        <Reveal className="mx-auto flex max-w-(--width-site) flex-wrap items-center justify-between gap-8">
          <div>
            <div className="font-mono text-[13px] tracking-[0.12em] text-blue-600">BEFORE YOU ASK</div>
            <h2 className="mt-3.5 font-display text-[clamp(32px,3.6vw,48px)] font-semibold leading-[1.05] tracking-[-0.032em]">
              You have questions. <span className="text-blue-600">We have straight answers.</span>
            </h2>
          </div>
          <Link
            href="/faq"
            className="whitespace-nowrap rounded-pill bg-navy-900 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Read the FAQ →
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
