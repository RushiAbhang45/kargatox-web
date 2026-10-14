import { prisma } from "@/lib/prisma";
import { PAGE_DEFAULTS, type PageKey } from "@/lib/page-content-defaults";

// Merges the published row's fields over the defaults rather than trusting
// the row alone — guards a page that's never been edited (no row yet) and a
// row that predates a newly added field (partial JSON blob).
export async function getPublishedPageContent(page: PageKey): Promise<Record<string, string>> {
  const row = await prisma.pageContent.findUnique({ where: { page } });
  const published = (row?.published as Record<string, string> | null) ?? {};
  return { ...PAGE_DEFAULTS[page], ...published };
}
