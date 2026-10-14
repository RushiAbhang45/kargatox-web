"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./topbar";

// Mirrors SiteHeader's pathname-reset pattern (src/components/site-header.tsx):
// derive/reset the open drawer during render on navigation instead of
// setState-in-effect, which eslint-plugin-react-hooks's set-state-in-effect
// rule treats as an error here.
export function AdminShell({
  newEnquiryCount,
  user,
  children,
}: {
  newEnquiryCount: number;
  user: { name: string | null; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);

  if (pathname !== openedFor) {
    setOpenedFor(pathname);
    setOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-admin-bg font-body text-admin-text">
      {open && (
        // Decorative dismiss layer, not a second "close" control: the real
        // close button lives inside AdminSidebar, so this stays out of the
        // tab order and accessibility tree (a <button> here would otherwise
        // duplicate that button's accessible name).
        <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />
      )}
      <AdminSidebar
        newEnquiryCount={newEnquiryCount}
        user={user}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar open={open} onToggle={() => setOpen((v) => !v)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-[28px]">{children}</main>
      </div>
    </div>
  );
}
