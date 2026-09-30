import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, GrowBar } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES } from "./data";

export const metadata: Metadata = {
  title: "Services — Kargatox",
  description:
    "Research and marketing services from Kargatox: market research, consumer behaviour analysis, campaign analytics, SEO, social media marketing and brand campaign strategy.",
};

export default function ServicesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="kx-float absolute -right-[180px] -top-[200px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(47,108,240,0.4),rgba(47,108,240,0)_70%)]" />
        <div className="relative mx-auto grid max-w-(--width-site) gap-7 px-6 pb-[90px] pt-[100px]">
          <div className="font-mono text-[13px] tracking-[0.12em] text-orange-400">SERVICES</div>
          <Reveal>
            <h1 className="max-w-[1040px] font-display text-[clamp(34px,4.4vw,60px)] font-semibold leading-[1.08] tracking-[-0.03em]">
              We don&apos;t simply deliver research or marketing services. We become an extension of your
              team, working alongside you to understand your business, solve challenges and create
              sustainable growth.
            </h1>
          </Reveal>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-x-14 gap-y-6 text-[18px] leading-[1.65] text-mist">
            <p>
              Our hands-on approach starts with understanding your business, defining the right strategy,
              mapping your audience and learning how they behave. We then turn those insights into focused
              execution across consulting, technology and marketing.
            </p>
            <p>
              Every engagement is driven by clear objectives and measurable KPIs, with transparent progress
              at every stage. You always know what we are doing, why we are doing it and how it contributes
              to your growth.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="#research"
              className="rounded-pill border border-white/25 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:border-orange-400"
            >
              Research Services ↓
            </Link>
            <Link
              href="#marketing"
              className="rounded-pill border border-white/25 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:border-orange-400"
            >
              Marketing Services ↓
            </Link>
          </div>
        </div>
      </section>

      {SERVICES.map((svc) => (
        <section key={svc.id} id={svc.id} className="px-6 pt-[110px]">
          <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-16 gap-y-10">
            <div className="sticky top-[110px]">
              <div className="font-mono text-[13px] tracking-[0.12em] text-blue-600">{svc.num}</div>
              <h2 className="mt-3.5 font-display text-[clamp(34px,4vw,56px)] font-semibold leading-[1.02] tracking-[-0.025em]">
                {svc.title}
              </h2>
              <p className="mt-[18px] text-[18px] leading-[1.65] text-slate">{svc.intro}</p>
              {svc.tagline && (
                <p className="mt-6 font-display text-2xl font-semibold tracking-[-0.01em] text-orange-500">
                  {svc.tagline}
                </p>
              )}

              <div className="mt-8 grid gap-[22px] rounded-[22px] bg-navy-900 p-6 text-white shadow-[0_30px_60px_-30px_rgba(11,20,48,0.5)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-success-dark" />
                    <span className="font-display text-lg font-semibold">{svc.panelTitle}</span>
                  </div>
                  <span className="rounded-pill border border-white/18 px-2.5 py-[5px] font-mono text-[11px] tracking-[0.08em] text-mist-2">
                    SAMPLE DATA
                  </span>
                </div>

                {svc.kind === "research" && (
                  <div className="grid gap-2.5">
                    <div className="flex h-[140px] items-end gap-1.5">
                      {svc.bars.map((b, i) => (
                        <GrowBar
                          key={i}
                          axis="y"
                          index={i}
                          className={`flex-1 rounded-t-[5px] rounded-b-[2px] ${b.orange ? "bg-orange-500" : "bg-blue-500"}`}
                          style={{ height: `${b.h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between font-mono text-[11px] text-[#6b7695]">
                      <span>JAN</span>
                      <span>JUN</span>
                      <span>DEC</span>
                    </div>
                  </div>
                )}

                {svc.kind === "marketing" && (
                  <>
                    <div className="grid gap-2">
                      {svc.keywords.map((k) => (
                        <div
                          key={k.term}
                          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3.5 rounded-xl bg-white/5 px-3.5 py-[11px]"
                        >
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] text-[#e3e8f5]">
                            {k.term}
                          </span>
                          <span className="font-mono text-xs text-[#6b7695] line-through">#{k.from}</span>
                          <span className="rounded-pill bg-success-dark/12 px-2.5 py-1 font-mono text-[13px] text-success-dark">
                            ↑ #{k.to}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 grid gap-3">
                      {svc.channels.map((c, i) => (
                        <div key={c.name} className="grid grid-cols-[90px_minmax(0,1fr)_44px] items-center gap-3">
                          <span className="text-[13px] text-mist-2">{c.name}</span>
                          <div className="h-2 overflow-hidden rounded-lg bg-white/8">
                            <GrowBar
                              axis="x"
                              index={i}
                              className={`h-full rounded-lg ${c.orange ? "bg-orange-500" : "bg-blue-300"}`}
                              style={{ width: `${c.w}%` }}
                            />
                          </div>
                          <span className="text-right font-mono text-xs text-white">{c.w}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {svc.kpis.map((kp) => (
                    <div key={kp.label} className="grid gap-1 rounded-xl bg-white/5 p-3.5">
                      <span className="text-xs text-mist-2">{kp.label}</span>
                      <span className="font-display text-2xl font-semibold">{kp.value}</span>
                      <span className="font-mono text-[11px] text-success-dark">{kp.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <RevealGroup className="grid gap-4">
              {svc.items.map((it) => (
                <div
                  key={it.num}
                  className="rounded-[20px] border border-line bg-white p-[30px] transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] hover:translate-x-1.5 hover:border-blue-500"
                >
                  <div className="flex gap-4">
                    <span className="font-mono text-[13px] text-blue-500">{it.num}</span>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.01em]">{it.title}</h3>
                      <p className="mt-2.5 text-base leading-[1.65] text-slate">{it.body}</p>
                      {it.link && (
                        <Link
                          href="#"
                          className="mt-3.5 inline-block text-[15px] font-semibold text-orange-500 hover:text-blue-600"
                        >
                          {it.link} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>
      ))}

      <div className="h-[120px]" />
      <SiteFooter />
    </main>
  );
}
