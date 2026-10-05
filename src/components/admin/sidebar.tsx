"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { signOutAction } from "@/app/admin/(protected)/actions";

export function AdminSidebar({
  newEnquiryCount,
  user,
}: {
  newEnquiryCount: number;
  user: { name: string | null; email: string; role: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-none flex-col bg-navy-900 text-white">
      <div className="px-6 pb-2 pt-7">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="relative block h-[26px] w-[26px]">
            <span className="absolute left-0 top-0 h-[18px] w-[18px] rounded-[5px] bg-orange-500" />
            <span className="absolute bottom-0 right-0 h-[18px] w-[18px] rounded-[5px] bg-blue-500 mix-blend-screen" />
          </span>
          <span className="font-display text-[18px] font-bold tracking-[-0.02em]">
            Karga<span className="text-orange-400">tox</span>
          </span>
        </Link>
        <span className="mt-1 block font-mono text-[11px] tracking-[0.14em] text-mist-2">ADMIN</span>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center justify-between rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-mist-2 hover:text-white"
              }`}
            >
              {item.label}
              {item.href === "/admin/enquiries" && newEnquiryCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {newEnquiryCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1 block rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium text-mist-2 transition-colors hover:text-white"
        >
          View live site ↗
        </a>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-orange-500 text-[13px] font-semibold text-white">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{user.name ?? user.email}</p>
            <p className="truncate font-mono text-[11px] tracking-[0.08em] text-mist-2">{user.role}</p>
          </div>
        </div>
        <form action={signOutAction} className="mt-3">
          <button type="submit" className="text-[13px] text-mist-2 underline-offset-2 hover:text-white hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
