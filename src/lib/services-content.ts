import { prisma } from "@/lib/prisma";
import { FAQ_DEFAULTS } from "@/lib/faq-defaults";

export type SubServiceItem = { title: string; body: string; link: string | null };
export type FaqRow = { id: string; question: string; answer: string };

// Falls back to src/app/(site)/services/data.ts's hardcoded items until an
// admin saves real rows for this service — same "default until edited"
// pattern as getPublishedPageContent() (src/lib/page-content.ts), just keyed
// by presence of any row instead of a published/draft split (Services & FAQ
// has no draft/publish per the README — a single "Save changes" replaces the
// live content outright).
export async function getSubServiceItems(serviceKey: string, fallback: SubServiceItem[]): Promise<SubServiceItem[]> {
  const rows = await prisma.subService.findMany({ where: { serviceKey }, orderBy: { order: "asc" } });
  if (rows.length === 0) return fallback;
  return rows.map((r) => ({ title: r.title, body: r.body, link: r.link }));
}

export async function getFaqItemsOrDefault(): Promise<FaqRow[]> {
  const rows = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) {
    return FAQ_DEFAULTS.map((f, i) => ({ id: `default-${i}`, question: f.question, answer: f.answer }));
  }
  return rows.map((r) => ({ id: r.id, question: r.question, answer: r.answer }));
}
