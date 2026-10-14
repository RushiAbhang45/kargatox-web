"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { signOutAction } from "@/app/admin/(protected)/actions";

export function AdminSidebar({
  newEnquiryCount,
  user,
  open,
  onClose,
}: {
  newEnquiryCount: number;
  user: { name: string | null; email: string; role: string };
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-none flex-col bg-navy-900 text-white transition-transform duration-300 ease-[cubic-bezier(.2,.7,.1,1)] motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-start justify-between gap-2 px-6 pb-2 pt-7">
        <div>
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
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
        {/* The sidebar sits above the topbar (z-40 vs z-10) so it covers the
            topbar's own toggle button once open — this is the only way to
            close the drawer by tapping something inside it, besides the
            backdrop. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] text-mist-2 transition-colors hover:text-white lg:hidden"
        >
          ✕
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
