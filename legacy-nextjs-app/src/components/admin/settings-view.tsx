"use client";

import { useState, useTransition } from "react";
import { useAdminToast } from "@/components/admin/toast";
import { saveSettings } from "@/app/admin/(protected)/settings/actions";
import type { SettingsData } from "@/lib/settings";

export function SettingsView({
  settings,
  smtpConfigured,
}: {
  settings: SettingsData;
  smtpConfigured: boolean;
}) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [notificationEmail, setNotificationEmail] = useState(settings.notificationEmail ?? "");
  const [alsoNotify, setAlsoNotify] = useState(settings.alsoNotify ?? "");
  const [autoReplyMessage, setAutoReplyMessage] = useState(settings.autoReplyMessage);
  const [sendAutoReply, setSendAutoReply] = useState(settings.sendAutoReply);
  const [gaMeasurementId, setGaMeasurementId] = useState(settings.gaMeasurementId ?? "");
  const [gaEnabled, setGaEnabled] = useState(settings.gaEnabled);
  const [isPending, startTransition] = useTransition();
  const showToast = useAdminToast();

  function handleSave() {
    startTransition(async () => {
      const result = await saveSettings({
        siteName,
        notificationEmail,
        alsoNotify,
        autoReplyMessage,
        sendAutoReply,
        gaMeasurementId,
        gaEnabled,
      });
      showToast(result.ok ? "Settings saved" : result.error);
    });
  }

  return (
    <div className="grid max-w-[720px] gap-[18px]">
      <div className="grid gap-4 rounded-[20px] border border-admin-border bg-admin-panel p-6">
        <h2 className="font-display text-[16px] font-semibold text-admin-text">General</h2>

        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">SITE NAME</span>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">NOTIFICATION EMAIL</span>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="you@kargatox.com"
            className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
          />
          <span className="text-[12px] text-admin-muted">Who gets the &quot;new enquiry&quot; email. Falls back to ADMIN_NOTIFY_EMAIL if left blank.</span>
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">ALSO NOTIFY</span>
          <input
            value={alsoNotify}
            onChange={(e) => setAlsoNotify(e.target.value)}
            placeholder="comma-separated extra emails"
            className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">AUTO-REPLY MESSAGE</span>
          <textarea
            value={autoReplyMessage}
            onChange={(e) => setAutoReplyMessage(e.target.value)}
            rows={4}
            className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
          />
          <span className="text-[12px] text-admin-muted">Use {"{firstName}"} to insert the enquirer&apos;s first name.</span>
        </label>

        <label className="flex items-center gap-2.5 text-[14px] text-admin-text">
          <input
            type="checkbox"
            checked={sendAutoReply}
            onChange={(e) => setSendAutoReply(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          Send auto-reply to enquiries
        </label>
      </div>

      <div className="grid gap-4 rounded-[20px] border border-admin-border bg-admin-panel p-6">
        <h2 className="font-display text-[16px] font-semibold text-admin-text">Integrations</h2>

        <div className="grid gap-3 rounded-[14px] border border-admin-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-admin-text">Google Analytics</span>
            <label className="flex items-center gap-2 text-[13px] text-admin-muted">
              <input
                type="checkbox"
                checked={gaEnabled}
                onChange={(e) => setGaEnabled(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Enabled
            </label>
          </div>
          <input
            value={gaMeasurementId}
            onChange={(e) => setGaMeasurementId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 font-mono text-[13px] text-admin-text outline-none focus:border-orange-400"
          />
        </div>

        <div className="grid gap-1.5 rounded-[14px] border border-admin-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-admin-text">Email (SMTP)</span>
            <span
              className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white ${
                smtpConfigured ? "bg-success" : "bg-admin-muted"
              }`}
            >
              {smtpConfigured ? "CONNECTED" : "NOT CONFIGURED"}
            </span>
          </div>
          <p className="text-[12px] text-admin-muted">
            Set via <code>SMTP_HOST</code>/<code>SMTP_PORT</code>/<code>SMTP_USER</code>/<code>SMTP_PASSWORD</code>{" "}
            environment variables, not here — credentials don&apos;t live in the database.
          </p>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-pill bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
        >
          Save settings
        </button>
      </div>
    </div>
  );
}
