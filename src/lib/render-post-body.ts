import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

// Post.body is Tiptap's own JSON (src/components/admin/post-editor.tsx's
// editor.getJSON(), serialized) — generateHTML only ever sees node/mark types
// StarterKit defines, so dangerouslySetInnerHTML'ing the result (see
// src/app/(site)/blog/[slug]/page.tsx) isn't an arbitrary-HTML injection
// vector the way raw user HTML would be. Writing a Post at all requires
// canAccessContent() (OWNER/ADMIN/EDITOR), not public input.
export function renderPostBody(body: string): string {
  try {
    const json = JSON.parse(body);
    return generateHTML(json, [StarterKit]);
  } catch {
    return "";
  }
}
