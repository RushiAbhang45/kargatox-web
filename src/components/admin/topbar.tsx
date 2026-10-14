"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { ThemeToggle } from "./theme-toggle";

export function AdminTopbar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const current =
    [...ADMIN_NAV].reverse().find((item) => pathname === item.href || pathname.startsWith(item.href + "/")) ??
    ADMIN_NAV[0];

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-admin-border bg-admin-panel px-4 py-3.5 sm:px-7 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* Opens the drawer only — once open, the sidebar sits above this bar
            (z-40 vs z-10) and physically covers this button, so closing is
            handled by the sidebar's own close button, a nav tap, or the
            backdrop (see AdminSidebar/AdminShell), not by tapping this again. */}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-admin-border text-[16px] text-admin-text lg:hidden"
        >
          ☰
        </button>
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] tracking-[0.12em] text-admin-muted">{current.breadcrumb}</p>
          <h1 className="mt-0.5 truncate font-display text-[18px] font-semibold tracking-[-0.01em] text-admin-text sm:text-[22px]">
            {current.label}
          </h1>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
