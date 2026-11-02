"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";

type ActionResult = { ok: true } | { ok: false; error: string };

type SubServiceInput = { title: string; body: string; link: string | null };
type FaqInput = { question: string; answer: string };

async function requireContentAccess() {
  const session = await auth();
  if (!session || !canAccessContent(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

// README: "A 'Save changes' button at the bottom" — one combined save for
// everything on the page (both service cards' sub-services and the FAQ list),
// so switching tabs never loses edits. Each set is a full bulk replace
// (delete + recreate in the given order) rather than a diff — simplest match
// for a UI with reorder/add/remove but no per-row identity that matters past
// this save.
export async function saveServicesAndFaq(
  subServices: Record<string, SubServiceInput[]>,
  faqItems: FaqInput[]
): Promise<ActionResult> {
  await requireContentAccess();

  const cleanSubServices = Object.fromEntries(
    Object.entries(subServices).map(([key, items]) => [
      key,
      items
        .map((it) => ({
          title: it.title.trim(),
          body: it.body.trim(),
          link: it.link?.trim() || null,
        }))
        .filter((it) => it.title && it.body),
    ])
  );
  const cleanFaq = faqItems
    .map((it) => ({ question: it.question.trim(), answer: it.answer.trim() }))
    .filter((it) => it.question && it.answer);

  await prisma.$transaction(async (tx) => {
    for (const [serviceKey, items] of Object.entries(cleanSubServices)) {
      await tx.subService.deleteMany({ where: { serviceKey } });
      if (items.length > 0) {
        await tx.subService.createMany({
          data: items.map((it, i) => ({ serviceKey, order: i, ...it })),
        });
      }
    }

    await tx.faqItem.deleteMany({});
    if (cleanFaq.length > 0) {
      await tx.faqItem.createMany({
        data: cleanFaq.map((it, i) => ({ order: i, ...it })),
      });
    }
  });

  revalidatePath("/admin/services-faq");
  revalidatePath("/services");
  revalidatePath("/faq");
  revalidatePath("/"); // Home teases the FAQ section; not its own editable field, but harmless to refresh
  return { ok: true };
}
