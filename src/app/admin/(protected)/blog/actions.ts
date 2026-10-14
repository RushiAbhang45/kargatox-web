"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { postInputSchema, type PostInput, type PostStatus } from "@/lib/post-schema";

type ActionResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

async function requireContentAccess() {
  const session = await auth();
  if (!session || !canAccessContent(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

async function upsertPost(id: string | null, input: PostInput, status: PostStatus): Promise<ActionResult> {
  await requireContentAccess();

  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post" };
  }
  const data = parsed.data;

  const slugOwner = await prisma.post.findUnique({ where: { slug: data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return { ok: false, error: "That URL slug is already used by another post" };
  }

  // Keep the original publishedAt across re-publishes (e.g. editing an
  // already-live post) rather than resetting it on every Publish click.
  let publishedAt: Date | undefined;
  if (status === "PUBLISHED") {
    const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
    publishedAt = existing?.publishedAt ?? new Date();
  }

  const payload = {
    title: data.title,
    slug: data.slug,
    type: data.type,
    authorId: data.authorId || null,
    excerpt: data.excerpt || null,
    body: data.body,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    status,
    ...(publishedAt !== undefined ? { publishedAt } : {}),
  };

  const post = id
    ? await prisma.post.update({ where: { id }, data: payload })
    : await prisma.post.create({ data: payload });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${post.id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, id: post.id, slug: post.slug };
}

export async function saveDraft(id: string | null, input: PostInput) {
  return upsertPost(id, input, "DRAFT");
}

export async function publishPost(id: string | null, input: PostInput) {
  return upsertPost(id, input, "PUBLISHED");
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireContentAccess();
  const post = await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, id: post.id, slug: post.slug };
}
