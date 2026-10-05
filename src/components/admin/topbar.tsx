"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { ThemeToggle } from "./theme-toggle";

export function AdminTopbar() {
  const pathname = usePathname();
  const current =
    [...ADMIN_NAV].reverse().find((item) => pathname === item.href || pathname.startsWith(item.href + "/")) ??
    ADMIN_NAV[0];

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-admin-border bg-admin-panel px-7 py-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.12em] text-admin-muted">{current.breadcrumb}</p>
        <h1 className="mt-0.5 font-display text-[22px] font-semibold tracking-[-0.01em] text-admin-text">
          {current.label}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
