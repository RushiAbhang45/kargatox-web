"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useAdminToast } from "@/components/admin/toast";
import { POST_TYPES, POST_TYPE_LABEL, slugify, type PostType } from "@/lib/post-schema";
import { saveDraft, publishPost, deletePost } from "@/app/admin/(protected)/blog/actions";

type Author = { id: string; name: string | null; email: string };
type PostData = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  authorId: string | null;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
};

function ToolbarButton({ active, onClick, label }: { active?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 min-w-7 items-center justify-center rounded-[6px] px-2 text-[12px] font-semibold transition-colors ${
        active ? "bg-orange-500 text-white" : "text-admin-text hover:bg-admin-soft"
      }`}
    >
      {label}
    </button>
  );
}

export function PostEditor({
  post,
  authors,
  currentUserId,
}: {
  post: PostData | null;
  authors: Author[];
  currentUserId: string;
}) {
  const router = useRouter();
  const showToast = useAdminToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [type, setType] = useState<PostType>((post?.type as PostType) ?? "BLOG");
  const [authorId, setAuthorId] = useState(post?.authorId ?? currentUserId);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");

  // immediatelyRender: false avoids a Tiptap/Next.js SSR hydration mismatch —
  // the editor only mounts content client-side.
  const editor = useEditor({
    extensions: [StarterKit],
    content: post?.body ? JSON.parse(post.body) : "",
    immediatelyRender: false,
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function buildInput() {
    return {
      title,
      slug,
      type,
      authorId: authorId || null,
      excerpt,
      body: JSON.stringify(editor?.getJSON() ?? {}),
      seoTitle,
      seoDescription,
    };
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveDraft(post?.id ?? null, buildInput());
      if (result.ok) {
        showToast("Draft saved");
        if (!post) router.replace(`/admin/blog/${result.id}`);
      } else {
        showToast(result.error);
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishPost(post?.id ?? null, buildInput());
      if (result.ok) {
        showToast("Published");
        if (!post) router.replace(`/admin/blog/${result.id}`);
      } else {
        showToast(result.error);
      }
    });
  }

  function handleDelete() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        showToast("Post deleted");
        router.push("/admin/blog");
      } else {
        showToast(result.error);
      }
    });
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/blog"
          className="text-[13px] font-medium text-admin-muted transition-colors hover:text-admin-text"
        >
          ← All posts
        </Link>
        <div className="flex gap-2">
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-pill border border-admin-border px-4 py-2 text-[13px] font-semibold text-admin-muted transition-colors hover:border-orange-500 hover:text-orange-500 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="rounded-pill border border-admin-border px-4 py-2 text-[13px] font-semibold text-admin-text transition-colors hover:border-orange-400 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
            className="rounded-pill bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 rounded-[20px] border border-admin-border bg-admin-panel p-6">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="rounded-input border border-admin-border bg-admin-bg px-3.5 py-3 font-display text-[24px] font-semibold text-admin-text outline-none focus:border-orange-400"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt"
            rows={2}
            className="rounded-input border border-admin-border bg-admin-bg px-3.5 py-2.5 text-[14px] text-admin-text outline-none focus:border-orange-400"
          />

          <div className="grid gap-1.5">
            <div className="flex gap-1 rounded-input border border-admin-border bg-admin-bg p-1.5">
              <ToolbarButton
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                label="B"
              />
              <ToolbarButton
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                label="I"
              />
              <ToolbarButton
                active={editor?.isActive("heading", { level: 2 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                label="H2"
              />
              <ToolbarButton
                active={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                label="•"
              />
              <ToolbarButton
                active={editor?.isActive("orderedList")}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                label="1."
              />
            </div>
            <EditorContent
              editor={editor}
              className="min-h-[320px] rounded-input border border-admin-border bg-admin-bg px-3.5 py-3 text-[14px] text-admin-text [&_.ProseMirror]:min-h-[290px] [&_.ProseMirror]:outline-none [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5"
            />
          </div>
        </div>

        <div className="grid gap-4 rounded-[20px] border border-admin-border bg-admin-panel p-5">
          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">TYPE</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            >
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {POST_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">AUTHOR</span>
            <select
              value={authorId ?? ""}
              onChange={(e) => setAuthorId(e.target.value)}
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            >
              <option value="">Unassigned</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name ?? a.email}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">URL SLUG</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 font-mono text-[13px] text-admin-text outline-none focus:border-orange-400"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">SEO TITLE</span>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">META DESCRIPTION</span>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[13px] text-admin-text outline-none focus:border-orange-400"
            />
          </label>

          <div className="rounded-input border border-admin-border bg-admin-bg p-3">
            <p className="font-mono text-[10px] tracking-[0.06em] text-admin-muted">SEARCH PREVIEW</p>
            <p className="mt-1.5 truncate text-[13px] text-[#1a0dab]">{seoTitle || title || "Post title"}</p>
            <p className="text-[11px] text-success">kargatox.com/blog/{slug || "post-slug"}</p>
            <p className="mt-0.5 line-clamp-2 text-[12px] text-admin-muted">
              {seoDescription || excerpt || "Meta description preview."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
