import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Revenue checks — Kargatox Admin" };

export default function AdminRevenueChecksPage() {
  return (
    <ComingSoon
      title="Revenue checks"
      note="Not built yet — the Home page's quiz now posts completed checks to the RevenueCheck table (build step 4), but the stats/table view here (build step 6) hasn't been built."
    />
  );
}
