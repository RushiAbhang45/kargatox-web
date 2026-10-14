import { z } from "zod";

export const POST_TYPES = ["BLOG", "CASE_STUDY"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABEL: Record<PostType, string> = {
  BLOG: "Blog",
  CASE_STUDY: "Case study",
};

export const POST_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "post";
}

export const postInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "URL slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  type: z.enum(POST_TYPES),
  authorId: z.string().trim().optional().nullable(),
  excerpt: z.string().trim().optional(),
  body: z.string(), // Tiptap JSON, serialized — see src/components/admin/post-editor.tsx
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export type PostInput = z.infer<typeof postInputSchema>;
