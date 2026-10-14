import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessContent } from "@/lib/roles";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "New post — Kargatox Admin" };

export default async function NewPostPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (!canAccessContent(session.user.role)) redirect("/admin/blog");

  const authors = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return <PostEditor post={null} authors={authors} currentUserId={session.user.id} />;
}
