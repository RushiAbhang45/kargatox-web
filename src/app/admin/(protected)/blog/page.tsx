import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Blog & case studies — Kargatox Admin" };

export default function AdminBlogPage() {
  return (
    <ComingSoon
      title="Blog & case studies"
      note="Not built yet — no Post model, editor, or public blog routes exist. That's build step 7."
    />
  );
}
