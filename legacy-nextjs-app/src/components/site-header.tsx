"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/nav-links";
import { ScrambleReveal } from "@/components/gsap/scramble-reveal";
import { SERVICE_PAGES, SERVICE_PAGE_GROUPS } from "@/lib/service-pages-data";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);

  if (pathname !== openedFor) {
    setOpenedFor(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-(--width-site) items-center justify-between gap-6 px-6 py-4">
        <Logo variant="light" />
        <div className="hidden font-mono text-xs uppercase tracking-[0.14em] text-slate nav:block">
          <ScrambleReveal text="Research · Marketing · Growth" />
        </div>
        <nav className="flex min-w-0 flex-none items-center justify-end gap-5">
          <div className="hidden min-w-0 flex-wrap justify-end gap-x-7 nav:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              const linkClass = `whitespace-nowrap border-b-2 pb-0.5 text-[15px] font-medium leading-6 transition-colors hover:text-ink ${
                active ? "border-orange-500 text-ink" : "border-transparent text-slate"
              }`;

              if (l.href !== "/services") {
                return (
                  <Link key={l.href} href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                );
              }

              // Services gets a hover/focus dropdown listing the six service
              // pages (grouped research/marketing) — CSS-only via `group` so
              // it works for mouse hover and keyboard focus alike, no extra
              // React state to manage.
              return (
                <div key={l.href} className="group relative">
                  <Link href={l.href} className={`inline-flex items-center gap-1 ${linkClass}`}>
                    {l.label}
                    <span
                      aria-hidden="true"
                      className="text-[9px] transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    >
                      ▾
                    </span>
                  </Link>
                  {/* Left-aligned (not centered) and narrow enough to stay inside the
                      viewport even at the 900px nav breakpoint, where "Services" sits
                      left-of-center with limited room on either side. */}
                  <div className="invisible absolute left-0 top-full z-20 w-[300px] pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="grid gap-5 rounded-card border border-line bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.28)]">
                      {SERVICE_PAGE_GROUPS.map((group) => (
                        <div key={group.heading} className="grid gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">
                            {group.heading}
                          </span>
                          {group.pages.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/${p.slug}`}
                              className="text-[14px] font-medium text-ink transition-colors hover:text-orange-500"
                            >
                              {p.navTitle}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/contact"
            className="hidden flex-none whitespace-nowrap rounded-pill bg-ink px-4.5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-orange-500 nav:block"
          >
            Start an Inquiry
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-line text-lg text-ink nav:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </nav>
      </div>
      {open && (
        <div className="border-t border-line bg-white nav:hidden">
          <div className="mx-auto grid max-w-(--width-site) px-6 pb-6 pt-3">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <div key={l.href} className="border-b border-line">
                  <Link
                    href={l.href}
                    className={`block py-3.5 font-display text-2xl font-semibold transition-colors hover:text-orange-500 ${
                      active ? "text-ink" : "text-slate"
                    }`}
                  >
                    {l.label}
                  </Link>
                  {l.href === "/services" && (
                    <div className="grid gap-0.5 pb-4 pl-1">
                      {SERVICE_PAGES.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/${p.slug}`}
                          className="py-1.5 text-[15px] text-slate transition-colors hover:text-orange-500"
                        >
                          {p.navTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
