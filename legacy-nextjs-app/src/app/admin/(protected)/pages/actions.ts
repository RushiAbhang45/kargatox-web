"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { PAGE_DEFAULTS, PAGE_FIELDS, PAGE_ROUTES, type PageKey } from "@/lib/page-content-defaults";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireContentAccess() {
  const session = await auth();
  if (!session || !canAccessContent(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

function sanitizeFields(page: PageKey, fields: Record<string, string>) {
  const allowedKeys = PAGE_FIELDS[page].map((f) => f.key);
  const clean: Record<string, string> = {};
  for (const key of allowedKeys) {
    clean[key] = String(fields[key] ?? "").trim();
  }
  return clean;
}

export async function savePageDraft(page: PageKey, fields: Record<string, string>): Promise<ActionResult> {
  await requireContentAccess();
  const clean = sanitizeFields(page, fields);

  await prisma.pageContent.upsert({
    where: { page },
    update: { draft: clean },
    create: { page, draft: clean, published: PAGE_DEFAULTS[page] },
  });

  revalidatePath("/admin/pages");
  return { ok: true };
}

export async function publishPage(page: PageKey, fields: Record<string, string>): Promise<ActionResult> {
  await requireContentAccess();
  const clean = sanitizeFields(page, fields);

  await prisma.pageContent.upsert({
    where: { page },
    update: { draft: Prisma.JsonNull, published: clean },
    create: { page, draft: Prisma.JsonNull, published: clean },
  });

  revalidatePath("/admin/pages");
  revalidatePath(PAGE_ROUTES[page]);
  return { ok: true };
}
