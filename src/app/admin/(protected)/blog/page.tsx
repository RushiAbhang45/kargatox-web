import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { BlogListView } from "@/components/admin/blog-list-view";

export const metadata: Metadata = { title: "Blog & case studies — Kargatox Admin" };

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  if (!canAccessContent(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Blog & case studies.
        </p>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <BlogListView
      posts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        status: p.status,
        authorName: p.author?.name ?? p.author?.email ?? null,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
