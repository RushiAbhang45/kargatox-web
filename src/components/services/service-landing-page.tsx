import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";
import { NumberedRows } from "@/components/numbered-rows";
import { FaqAccordion } from "@/app/(site)/faq/faq-accordion";
import { SiteFooter } from "@/components/site-footer";
import { BulletList } from "@/components/services/bullet-list";
import { getRelatedServicePages, type ServicePageContent } from "@/lib/service-pages-data";

// Shared template for the six standalone service pages (one page.tsx per slug under
// src/app/(site)/ supplies `content` + its own `metadata` export). See
// src/lib/service-pages-data.ts for what populated this and why.
export function ServiceLandingPage({ content }: { content: ServicePageContent }) {
  const related = getRelatedServicePages(content);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-white text-ink">
        <div className="mx-auto grid max-w-(--width-site) gap-5 px-6 pb-[48px] pt-[56px]">
          <div className="font-mono text-[12px] tracking-[0.12em] text-orange-500">
            <ScrambleReveal text={content.eyebrow} />
          </div>
          <Reveal>
            <h1 className="max-w-[760px] font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-0.022em]">
              {content.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[760px] text-[15px] leading-[1.7] text-slate">{content.intro}</p>
          </Reveal>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-pill bg-ink px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-orange-500"
            >
              Start an Inquiry →
            </Link>
            <Link
              href="/services"
              className="rounded-pill border border-line px-6 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-orange-500"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-[16px] pt-[8px]">
        <div className="mx-auto max-w-(--width-site)">
          <Reveal>
            <h2 className="font-display text-[clamp(22px,2.6vw,30px)] font-bold tracking-[-0.02em]">
              {content.coverHeading}
            </h2>
          </Reveal>
          <NumberedRows
            className="mt-6 max-w-[820px]"
            variant="full"
            theme="light"
            items={content.coverItems.map((it, i) => ({
              num: String(i + 1).padStart(2, "0"),
              title: it.title,
              body: it.body,
            }))}
          />
        </div>
      </section>

      <section className="px-6 py-[48px]">
        <div className="mx-auto grid max-w-(--width-site) gap-10 rounded-panel bg-ink p-[clamp(28px,5vw,56px)] text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal>
            <h2 className="font-display text-[clamp(20px,2.4vw,28px)] font-bold tracking-[-0.02em]">
              {content.approachHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-mist-2">{content.approachBody}</p>
          </Reveal>
          {content.steps && (
            <div>
              {content.steps.heading && (
                <div className="font-mono text-[12px] uppercase tracking-[0.12em] text-orange-400">
                  {content.steps.heading}
                </div>
              )}
              <NumberedRows
                className={content.steps.heading ? "mt-4" : undefined}
                variant="tight"
                theme="dark"
                items={content.steps.items.map((s, i) => ({
                  num: String(i + 1).padStart(2, "0"),
                  title: s.label,
                  body: s.body,
                }))}
              />
            </div>
          )}
        </div>
      </section>

      {content.bulletLists.length > 0 && (
        <section className="px-6 pb-[16px]">
          <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-10">
            {content.bulletLists.map((list) => (
              <BulletList key={list.heading} heading={list.heading} items={list.items} />
            ))}
          </div>
        </section>
      )}

      <section className="px-6 py-[56px]">
        <div className="mx-auto max-w-[820px]">
          <Reveal>
            <h2 className="font-display text-[clamp(22px,2.6vw,30px)] font-bold tracking-[-0.02em]">
              {content.faqHeading}
            </h2>
          </Reveal>
          <div className="mt-6">
            <FaqAccordion items={content.faqs.map((f, i) => ({ id: `${content.slug}-faq-${i}`, ...f }))} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-6 pb-[32px]">
          <div className="mx-auto flex max-w-(--width-site) flex-wrap items-center gap-3 border-t border-line-2 pt-8 text-[14px]">
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-slate">Related services</span>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="rounded-chip border border-line px-3.5 py-1.5 font-semibold text-ink transition-colors hover:border-orange-500 hover:text-orange-500"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
