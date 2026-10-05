import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Pages — Kargatox Admin" };

export default function AdminPagesPage() {
  return (
    <ComingSoon
      title="Pages"
      note="Not built yet — public-site copy is still hardcoded in each page component, not stored in a PageContent table with draft/published versions. That's build step 7."
    />
  );
}
