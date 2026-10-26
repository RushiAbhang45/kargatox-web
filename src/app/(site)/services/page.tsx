import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, GrowBar } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES } from "./data";
import { getPublishedPageContent } from "@/lib/page-content";
import { getSubServiceItems } from "@/lib/services-content";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";
import { SUB_SERVICE_HREFS } from "@/lib/service-pages-data";

export const metadata: Metadata = {
  title: "Services — Kargatox",
  description:
    "Research and marketing services from Kargatox: market research, consumer behaviour analysis, campaign analytics, SEO, social media marketing and brand campaign strategy.",
};

export default async function ServicesPage() {
  const content = await getPublishedPageContent("services");
  const servicesWithItems = await Promise.all(
    SERVICES.map(async (svc) => {
      const items = await getSubServiceItems(
        svc.id,
        svc.items.map((it) => ({ title: it.title, body: it.body, link: it.link }))
      );
      return { ...svc, items: items.map((it, i) => ({ ...it, num: String(i + 1).padStart(2, "0") })) };
    })
  );
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-white text-ink">
        <div className="relative mx-auto grid max-w-(--width-site) gap-5 px-6 pb-[48px] pt-[56px]">
          <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">
            <ScrambleReveal text="SERVICES" />
          </div>
          <Reveal>
            <h1 className="max-w-[720px] font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-0.022em]">
              {content.introHeadline}
            </h1>
          </Reveal>
          <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-x-12 gap-y-4 text-[15px] leading-[1.6] text-slate">
            <p>{content.introParagraph1}</p>
            <p>{content.introParagraph2}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2.5">
            <Link
              href="#research"
              className="rounded-input border border-line px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-orange-500"
            >
              Research Services ↓
            </Link>
            <Link
              href="#marketing"
              className="rounded-input border border-line px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-orange-500"
            >
              Marketing Services ↓
            </Link>
          </div>
        </div>
      </section>

      {servicesWithItems.map((svc, i) => (
        <section key={svc.id} id={svc.id} className={`px-6 ${i === 0 ? "pt-[40px]" : "pt-[64px]"}`}>
          <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-12 gap-y-8">
            <div className="sticky top-[88px]">
              <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">{svc.num}</div>
              <h2 className="mt-2.5 font-display text-[clamp(24px,3vw,36px)] font-bold leading-[1.08] tracking-[-0.02em]">
                {svc.title}
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate">{svc.intro}</p>
              {svc.tagline && (
                <p className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-orange-500">
                  {svc.tagline}
                </p>
              )}

              <div className="mt-6 grid gap-4 rounded-panel bg-ink p-5 text-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-dark" />
                    <span className="font-display text-[15px] font-bold">{svc.panelTitle}</span>
                  </div>
                  <span className="rounded-chip border border-white/18 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-mist-2">
                    SAMPLE DATA
                  </span>
                </div>

                {svc.kind === "research" && (
                  <div className="grid gap-2">
                    <div className="flex h-[90px] items-end gap-1">
                      {svc.bars.map((b, i) => (
                        <GrowBar
                          key={i}
                          axis="y"
                          index={i}
                          className={`flex-1 rounded-t-[4px] rounded-b-[2px] ${b.orange ? "bg-orange-500" : "bg-white/25"}`}
                          style={{ height: `${b.h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-[#737373]">
                      <span>JAN</span>
                      <span>JUN</span>
                      <span>DEC</span>
                    </div>
                  </div>
                )}

                {svc.kind === "marketing" && (
                  <>
                    <div className="grid gap-1.5">
                      {svc.keywords.map((k) => (
                        <div
                          key={k.term}
                          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2"
                        >
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#e5e5e5]">
                            {k.term}
                          </span>
                          <span className="font-mono text-[11px] text-[#737373] line-through">#{k.from}</span>
                          <span className="rounded-chip bg-success-dark/12 px-2 py-0.5 font-mono text-[11px] text-success-dark">
                            ↑ #{k.to}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 grid gap-2">
                      {svc.channels.map((c, i) => (
                        <div key={c.name} className="grid grid-cols-[76px_minmax(0,1fr)_36px] items-center gap-2.5">
                          <span className="text-[12px] text-mist-2">{c.name}</span>
                          <div className="h-1.5 overflow-hidden rounded-lg bg-white/8">
                            <GrowBar
                              axis="x"
                              index={i}
                              className={`h-full rounded-lg ${c.orange ? "bg-orange-500" : "bg-white/35"}`}
                              style={{ width: `${c.w}%` }}
                            />
                          </div>
                          <span className="text-right font-mono text-[11px] text-white">{c.w}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-1.5">
                  {svc.kpis.map((kp) => (
                    <div key={kp.label} className="grid gap-1 rounded-lg bg-white/5 p-2.5">
                      <span className="text-[11px] text-mist-2">{kp.label}</span>
                      <span className="font-display text-lg font-bold">{kp.value}</span>
                      <span className="font-mono text-[10px] text-success-dark">{kp.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <RevealGroup className="grid gap-3">
              {svc.items.map((it) => {
                // The DB/admin `link` field (src/lib/services-content.ts) is display text
                // only — the real destination comes from this title lookup, so renamed or
                // admin-added rows that aren't one of the six known service pages just show
                // no link rather than a dead "#" href.
                const href = SUB_SERVICE_HREFS[it.title];
                return (
                  <div
                    key={it.num}
                    className="rounded-card border border-line bg-white p-5 transition-[transform,border-color] duration-500 ease-[var(--ease-kx)] hover:translate-x-1 hover:border-orange-500"
                  >
                    <div className="flex gap-3">
                      <span className="font-mono text-[12px] text-orange-500">{it.num}</span>
                      <div className="flex-1">
                        <h3 className="font-display text-[17px] font-bold tracking-[-0.01em]">{it.title}</h3>
                        <p className="mt-2 text-[14px] leading-[1.6] text-slate">{it.body}</p>
                        {href && (
                          <Link
                            href={href}
                            className="mt-2.5 inline-block text-[14px] font-semibold text-orange-500 hover:text-ink"
                          >
                            {it.link ?? "Learn more"} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </RevealGroup>
          </div>
        </section>
      ))}

      <div className="h-[64px]" />
      <SiteFooter />
    </main>
  );
}
