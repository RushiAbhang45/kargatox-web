import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav-links";

export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <>
      {showCta && (
        <section className="bg-paper px-6 pb-[120px]">
          <div className="mx-auto max-w-(--width-site) rounded-panel bg-blue-500 p-[clamp(40px,7vw,96px)] text-white">
            <div className="max-w-[640px]">
              <h2 className="font-display text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.08] tracking-[-0.028em]">
                We move the only number that matters. Yours.
              </h2>
              <div className="mt-9 flex flex-wrap gap-3.5">
                <Link
                  href="/contact"
                  className="rounded-pill bg-navy-900 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-700"
                >
                  Start an Inquiry →
                </Link>
                <Link
                  href="/services"
                  className="rounded-pill bg-white px-7 py-4 text-base font-semibold text-navy-900 transition-colors hover:text-blue-600"
                >
                  See our services
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      <footer className="bg-navy-900 px-6 pb-10 pt-16 text-mist-2 font-body">
        <div className="mx-auto flex max-w-(--width-site) flex-wrap items-start justify-between gap-8">
          <div className="grid max-w-[340px] gap-3.5">
            <span className="font-display text-[26px] font-bold tracking-[-0.02em] text-white">
              Karga<span className="text-orange-400">tox</span>
            </span>
            <p className="text-[15px] leading-[1.6]">
              Strategy, research and marketing for founders and leadership teams across India.
            </p>
          </div>
          <div className="flex flex-wrap gap-7 text-[15px]">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-mist transition-colors hover:text-blue-300">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-(--width-site) border-t border-white/10 pt-6 text-sm">
          © 2026 Kargatox. All rights reserved.
        </div>
      </footer>
    </>
  );
}
