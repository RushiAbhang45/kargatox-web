"use client";

import { useState } from "react";
import Link from "next/link";
import { POST_TYPE_LABEL, type PostType } from "@/lib/post-schema";

type PostRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  authorName: string | null;
  createdAt: string;
};

const FILTERS = ["ALL", "BLOG", "CASE_STUDY"] as const;
type Filter = (typeof FILTERS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function BlogListView({ posts }: { posts: PostRow[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const filtered = filter === "ALL" ? posts : posts.filter((p) => p.type === filter);

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                filter === f
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-admin-border text-admin-muted hover:text-admin-text"
              }`}
            >
              {f === "ALL" ? "All" : POST_TYPE_LABEL[f as PostType]}
            </button>
          ))}
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-pill bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400"
        >
          + New post
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {filtered.length === 0 && (
          <p className="col-span-full rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center text-[14px] text-admin-muted">
            No posts yet.
          </p>
        )}
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="grid gap-3 rounded-[16px] border border-admin-border bg-admin-panel p-4 transition-colors hover:border-orange-400"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white ${
                  post.type === "CASE_STUDY" ? "bg-orange-500" : "bg-blue-500"
                }`}
              >
                {POST_TYPE_LABEL[post.type as PostType] ?? post.type}
              </span>
              <span
                className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white ${
                  post.status === "PUBLISHED" ? "bg-success" : "bg-admin-muted"
                }`}
              >
                {post.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <h3 className="font-display text-[17px] font-semibold leading-snug text-admin-text">{post.title}</h3>
            <p className="text-[12px] text-admin-muted">
              {post.authorName ?? "Unassigned"} · {formatDate(post.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
