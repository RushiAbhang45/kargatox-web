import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteFooter } from "@/components/site-footer";
import { POST_TYPE_LABEL, type PostType } from "@/lib/post-schema";

export const metadata: Metadata = {
  title: "Blog — Kargatox",
  description: "Insights, case studies, and updates from the Kargatox team.",
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogListPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-navy-900 px-6 pb-[90px] pt-[100px] text-white">
        <div className="mx-auto max-w-(--width-site)">
          <div className="font-mono text-[13px] tracking-[0.12em] text-blue-300">BLOG & CASE STUDIES</div>
          <h1 className="mt-3.5 font-display text-[clamp(32px,4vw,52px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Insights from the work.
          </h1>
        </div>
      </section>

      <section className="px-6 py-[80px]">
        <div className="mx-auto grid max-w-(--width-site) grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {posts.length === 0 && (
            <p className="text-[16px] text-slate">No posts yet — check back soon.</p>
          )}
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group grid gap-3 rounded-card border border-line bg-white p-7 transition-colors duration-500 ease-[var(--ease-kx)] hover:border-blue-500"
            >
              <span
                className={`w-fit rounded-chip px-3 py-1 text-[12px] font-semibold text-white ${
                  post.type === "CASE_STUDY" ? "bg-orange-500" : "bg-blue-500"
                }`}
              >
                {POST_TYPE_LABEL[post.type as PostType] ?? post.type}
              </span>
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-ink transition-colors group-hover:text-blue-600">
                {post.title}
              </h2>
              {post.excerpt && <p className="text-[15px] leading-[1.6] text-slate">{post.excerpt}</p>}
              <p className="text-[13px] text-slate">
                {post.author?.name ?? post.author?.email ?? "Kargatox"}
                {post.publishedAt && ` · ${formatDate(post.publishedAt)}`}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
