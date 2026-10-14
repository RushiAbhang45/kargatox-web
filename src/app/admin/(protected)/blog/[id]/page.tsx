import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "Edit post — Kargatox Admin" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (!canAccessContent(session.user.role)) redirect("/admin/blog");

  const { id } = await params;

  const [post, authors] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        type: post.type,
        status: post.status,
        authorId: post.authorId,
        excerpt: post.excerpt ?? "",
        body: post.body,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
      }}
      authors={authors}
      currentUserId={session.user.id}
    />
  );
}
