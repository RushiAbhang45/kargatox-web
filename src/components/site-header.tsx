"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/nav-links";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);

  if (pathname !== openedFor) {
    setOpenedFor(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900">
      <div className="mx-auto flex max-w-(--width-site) items-center justify-between gap-6 px-6 py-4">
        <Logo />
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-5">
          <div className="hidden min-w-0 flex-1 flex-wrap justify-end gap-x-7 nav:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`whitespace-nowrap border-b-2 pb-0.5 text-[15px] font-medium leading-6 transition-colors hover:text-white ${
                    active ? "border-orange-500 text-white" : "border-transparent text-mist"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <Link
            href="/contact"
            className="hidden flex-none whitespace-nowrap rounded-pill bg-orange-500 px-4.5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-orange-400 nav:block"
          >
            Start an Inquiry
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-white/18 text-lg text-white nav:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </nav>
      </div>
      {open && (
        <div className="border-t border-white/8 bg-navy-900 nav:hidden">
          <div className="mx-auto grid max-w-(--width-site) px-6 pb-6 pt-3">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`border-b border-white/8 py-3.5 font-display text-2xl font-semibold transition-colors hover:text-orange-400 ${
                    active ? "text-white" : "text-mist"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
