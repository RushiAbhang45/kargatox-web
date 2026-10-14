import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { PAGE_KEYS, PAGE_DEFAULTS } from "@/lib/page-content-defaults";
import { PagesView } from "@/components/admin/pages-view";

export const metadata: Metadata = { title: "Pages — Kargatox Admin" };

export default async function AdminPagesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  // README's Team role table: Editor gets pages/services/FAQ/blog access;
  // Sales doesn't. Enforced here (server), not just by hiding the sidebar
  // link — same pattern as the Enquiries/Team pages.
  if (!canAccessContent(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Pages.
        </p>
      </div>
    );
  }

  const rows = await prisma.pageContent.findMany();
  const byPage = new Map(rows.map((r) => [r.page, r]));

  const pages = PAGE_KEYS.map((page) => {
    const row = byPage.get(page);
    const published = { ...PAGE_DEFAULTS[page], ...((row?.published as Record<string, string>) ?? {}) };
    const draft = row?.draft ? { ...published, ...(row.draft as Record<string, string>) } : null;
    return { page, published, draft };
  });

  return <PagesView pages={pages} />;
}
