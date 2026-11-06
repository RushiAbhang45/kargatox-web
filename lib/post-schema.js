// Ported from legacy-nextjs-app/src/lib/post-schema.ts, with zod swapped for a plain
// validate() function (no zod dependency in this app). `body` here is plain HTML/text
// typed into a <textarea> — deliberately NOT the legacy app's Tiptap JSON. This app has
// no client-side framework and no rich-text editor dependency, so porting Tiptap/ProseMirror
// would be a much bigger scope addition than anything else in the admin panel; a textarea
// is a reasonable v1 and the public blog template (Phase 8) can render it as raw HTML.
const POST_TYPES = ["BLOG", "CASE_STUDY"];
const POST_TYPE_LABEL = { BLOG: "Blog", CASE_STUDY: "Case study" };
const POST_STATUSES = ["DRAFT", "PUBLISHED"];

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function slugify(input) {
  const slug = String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "post";
}

function validatePost(input) {
  if (!input.title) return "Title is required";
  if (!input.slug) return "URL slug is required";
  if (!SLUG_PATTERN.test(input.slug)) return "Slug can only contain lowercase letters, numbers and hyphens";
  if (!POST_TYPES.includes(input.type)) return "Invalid post type";
  return null;
}

module.exports = { POST_TYPES, POST_TYPE_LABEL, POST_STATUSES, slugify, validatePost };
