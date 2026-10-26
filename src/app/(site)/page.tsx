import Link from "next/link";
import { Reveal, RevealGroup, RiseWords } from "@/components/motion/reveal";
import { RevenueCheck } from "@/components/home/revenue-check";
import { SiteFooter } from "@/components/site-footer";
import { PROCESS_STEPS } from "@/lib/process-steps";
import { getPublishedPageContent } from "@/lib/page-content";
import { splitFirstSentence } from "@/lib/text-split";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";
import { SectionIntro } from "@/components/schbang/section-intro";

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

function GridBackdrop({ className, dark = false }: { className?: string; dark?: boolean }) {
  const lineColor = dark ? "255,255,255" : "15,23,42"; // white on ink / ink on paper
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute opacity-[0.16] ${className ?? ""}`}
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent 0 110px, rgba(${lineColor},1) 110px 111px), repeating-linear-gradient(0deg, transparent 0 110px, rgba(${lineColor},1) 110px 111px)`,
        maskImage: "radial-gradient(circle at 20% 30%, black 0%, transparent 70%)",
      }}
    />
  );
}

export default async function Home() {
  const content = await getPublishedPageContent("home");
  // RiseWords needs a word array; only the final word gets the accent class,
  // matching the original hardcoded "Growth." styling (see src/lib/text-split.ts) —
  // orange-500 here instead of the old blue-300, per the redesign's accent colour.
  const heroWords = content.heroHeadline.split(" ").map((text, i, arr) => ({
    text,
    ...(i === arr.length - 1 ? { className: "text-orange-500" } : {}),
  }));
  const [capabilitiesPlain, capabilitiesAccent] = splitFirstSentence(content.capabilitiesHeading);

  return (
    <main className="flex flex-1 flex-col">
      {/* Full-width hero — no sidebar stat list beside the headline. That
          stat/pillar content moved into its own "What defines us" section
          below, laid out horizontally instead of as a tall numbered list:
          a hero that's just headline + subhead + CTA is what actually reads
          as Schbang's layout, not a recolor of the original split hero. */}
      <section className="relative overflow-hidden bg-white text-ink">
        <GridBackdrop className="inset-x-0 top-0 h-[520px]" />
        <div className="relative mx-auto max-w-(--width-site) px-6 pb-[48px] pt-[56px]">
          <div className="inline-flex items-center gap-2.5 rounded-chip border border-line px-3.5 py-[7px] font-mono text-xs uppercase tracking-[0.08em] text-slate">
            <span className="h-[7px] w-[7px] rounded-full bg-orange-500" />
            <ScrambleReveal text="Strategy · Research · Growth" />
          </div>
          <h1 className="mt-6 max-w-[760px] font-display text-[clamp(30px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.025em]">
            <RiseWords words={heroWords} />
          </h1>
          <div className="mt-7 flex flex-col gap-6 border-t border-line pt-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal delay={0.3}>
              <p className="max-w-[480px] text-[clamp(15px,1.3vw,17px)] leading-[1.6] text-slate">
                {content.heroSubheading}
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex flex-none flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-pill bg-orange-500 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  Start an Inquiry →
                </Link>
                <Link
                  href="/services"
                  className="rounded-input border border-line px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-orange-500"
                >
                  Explore services
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-t border-b border-white/8 bg-ink py-[14px]">
        <div className="kx-marquee-track flex w-max">
          {[...TICKER, ...TICKER].map((label, i) => (
            <span
              key={i}
              className="flex items-center gap-4 whitespace-nowrap pr-4 font-display text-[clamp(13px,1.2vw,16px)] font-semibold tracking-[-0.01em] text-white"
            >
              <span className={`h-1.5 w-1.5 rounded-[2px] ${i % 2 ? "bg-white" : "bg-orange-500"}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* "What defines us" — Schbang's own section pattern (eyebrow + giant
          arrow glyph, grid backdrop), repurposed to carry the pillar content
          that used to sit in the hero sidebar, now as a horizontal row of
          three cards instead of a vertical numbered list. */}
      <section className="relative overflow-hidden bg-white px-6 py-[64px]">
        <GridBackdrop className="-left-[10%] top-0 h-full w-[60%]" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[6%] -right-[2%] select-none whitespace-nowrap font-display text-[16vw] font-bold leading-none text-ink/[0.035]"
        >
          Kargatox
        </span>
        <div className="relative mx-auto max-w-(--width-site)">
          <SectionIntro
            eyebrow="WHAT DEFINES US"
            title="Founder-led, numbers-obsessed, and in the weeds with your team."
          />
          <RevealGroup className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.num} className="border-t border-line pt-4">
                <div className="font-display text-[13px] font-bold text-orange-500">{p.num}</div>
                <h3 className="mt-2 font-display text-[18px] font-bold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-slate">{p.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="px-6 pt-[48px] pb-[48px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-end gap-x-16 gap-y-8">
          <div>
            <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">
              <ScrambleReveal text="OUR CAPABILITIES" />
            </div>
            <h2 className="mt-2.5 font-display text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.08] tracking-[-0.022em]">
              {capabilitiesPlain}
              {capabilitiesAccent && <span className="text-orange-500"> {capabilitiesAccent}</span>}
            </h2>
          </div>
          <p className="text-[16px] leading-[1.6] text-slate">{content.capabilitiesBody}</p>
        </div>
      </section>

      {/* Static two-up panels for the two service lines — previously a GSAP
          ScrollTrigger pin+scrub horizontal slider (see git history), pulled
          out after repeated reports that it rendered incorrectly (blank gaps,
          overlapping content) across real-world testing. Keeps the same
          visual design (ghost wordmark, chips, "View details" link), just as
          a plain responsive grid with no scroll-jacking. */}
      <section className="px-6 py-[56px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-1 overflow-hidden rounded-card border border-line bg-paper sm:grid-cols-2">
          {CAPABILITY_SERVICES.map((s, i) => (
            <Link
              key={s.num}
              href="/services"
              className={`group relative flex flex-col justify-center gap-4 overflow-hidden bg-white p-6 text-ink transition-colors hover:bg-paper sm:p-10 ${
                i === 0 ? "border-b border-line sm:border-b-0 sm:border-r" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-[2%] top-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(56px,10vw,110px)] font-bold leading-none text-ink/[0.04]"
              >
                {s.title.split(" ")[0]}
              </span>
              <div className="relative font-mono text-[13px] text-orange-500">{s.num}</div>
              <h3 className="relative max-w-[460px] font-display text-[clamp(24px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.02em]">
                {s.title}
              </h3>
              <div className="relative flex flex-wrap gap-2">
                {s.subs.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-chip bg-chip-cool px-3.5 py-2 text-[13px] font-medium text-[#262626]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
              <span className="relative mt-1 inline-flex items-center gap-1 text-[15px] font-semibold text-orange-500 transition-transform duration-300 group-hover:translate-x-1">
                View details →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <RevenueCheck />

      <section className="relative overflow-hidden bg-ink px-6 py-[64px] text-white">
        <GridBackdrop dark className="-right-[15%] top-0 h-full w-[60%]" />
        <div className="relative mx-auto max-w-(--width-site)">
          <SectionIntro
            eyebrow="HOW WE WORK"
            dark
            title={
              <>
                We do the work.
                <br />
                <span className="text-white/60">You keep the system.</span>
              </>
            }
            cta={
              <Link
                href="/how-we-work"
                className="whitespace-nowrap rounded-input border border-white/25 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:border-orange-400"
              >
                See the full process →
              </Link>
            }
          />
          <RevealGroup className="mt-9 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-3">
            {PROCESS_STEPS.slice(0, 3).map((s) => (
              <div key={s.num} className="border-t border-white/12 pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-display text-[13px] font-bold text-orange-400">{s.num}</div>
                  <span className="rounded-chip bg-white/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-mist-2">
                    {s.when}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-[16px] font-bold tracking-[-0.01em] text-white">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-mist-2">{s.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 pt-[48px] pb-[64px]">
        <GridBackdrop className="-right-[10%] top-0 h-full w-[55%]" />
        <Reveal className="relative mx-auto max-w-(--width-site)">
          <SectionIntro
            eyebrow="BEFORE YOU ASK"
            title={
              <>
                You have questions. <span className="text-orange-500">We have straight answers.</span>
              </>
            }
            arrow="right"
            cta={
              <Link
                href="/faq"
                className="whitespace-nowrap rounded-pill bg-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-orange-500"
              >
                Read the FAQ →
              </Link>
            }
          />
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
