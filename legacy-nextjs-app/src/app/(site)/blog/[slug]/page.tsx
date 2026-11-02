import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteFooter } from "@/components/site-footer";
import { renderPostBody } from "@/lib/render-post-body";
import { POST_TYPE_LABEL, type PostType } from "@/lib/post-schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return {};
  return {
    title: `${post.seoTitle || post.title} — Kargatox`,
    description: post.seoDescription || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!post || post.status !== "PUBLISHED") notFound();

  const html = renderPostBody(post.body);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-navy-900 px-6 pb-[70px] pt-[100px] text-white">
        <div className="mx-auto max-w-[760px]">
          <span
            className={`inline-block rounded-chip px-3 py-1 text-[12px] font-semibold text-white ${
              post.type === "CASE_STUDY" ? "bg-orange-500" : "bg-blue-500"
            }`}
          >
            {POST_TYPE_LABEL[post.type as PostType] ?? post.type}
          </span>
          <h1 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            {post.title}
          </h1>
          <p className="mt-3 text-[14px] text-mist">
            {post.author?.name ?? post.author?.email ?? "Kargatox"}
            {post.publishedAt &&
              ` · ${post.publishedAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </div>
      </section>
      <section className="px-6 py-[70px]">
        {/* See src/lib/render-post-body.ts for why this HTML is safe to inject. */}
        <div
          className="mx-auto max-w-[760px] text-[17px] leading-[1.7] text-ink [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:font-semibold [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
      <SiteFooter />
    </main>
  );
}
