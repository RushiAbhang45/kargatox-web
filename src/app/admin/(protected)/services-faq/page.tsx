import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Services & FAQ — Kargatox Admin" };

export default function AdminServicesFaqPage() {
  return (
    <ComingSoon
      title="Services & FAQ"
      note="Not built yet — service and FAQ content is still hardcoded (src/app/(site)/services/data.ts, src/app/(site)/faq/page.tsx), not editable here. That's build step 7."
    />
  );
}
