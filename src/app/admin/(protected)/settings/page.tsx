import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Settings — Kargatox Admin" };

export default function AdminSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      note="Not built yet — no Settings model, and none of the integrations (GA, CRM, SMTP, WhatsApp, Slack, Meta Pixel) are wired up. That's build step 8."
    />
  );
}
