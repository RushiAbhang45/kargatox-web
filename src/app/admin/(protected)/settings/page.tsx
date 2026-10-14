import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessSettings } from "@/lib/roles";
import { getSettings } from "@/lib/settings";
import { SettingsView } from "@/components/admin/settings-view";

export const metadata: Metadata = { title: "Settings — Kargatox Admin" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  if (!canAccessSettings(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Settings.
        </p>
      </div>
    );
  }

  const settings = await getSettings();
  // Same check src/lib/mailer.ts's getTransporter() makes — shown read-only
  // here rather than editable (see CLAUDE.md: SMTP credentials stay env-only,
  // never stored in the database).
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );

  return <SettingsView settings={settings} smtpConfigured={smtpConfigured} />;
}
