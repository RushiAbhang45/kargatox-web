import { prisma } from "@/lib/prisma";

export type SettingsData = {
  siteName: string;
  notificationEmail: string | null;
  alsoNotify: string | null;
  autoReplyMessage: string;
  sendAutoReply: boolean;
  gaMeasurementId: string | null;
  gaEnabled: boolean;
};

const DEFAULTS: SettingsData = {
  siteName: "Kargatox",
  notificationEmail: null,
  alsoNotify: null,
  autoReplyMessage:
    "Hi {firstName},\n\nThank you for your requirement. Our team will contact you shortly.\n\n— Kargatox",
  sendAutoReply: true,
  gaMeasurementId: null,
  gaEnabled: false,
};

const SETTINGS_ID = "singleton";

// Same "no row yet = defaults" pattern as getPublishedPageContent() — no
// seeding needed, src/app/admin/(protected)/settings/actions.ts's
// saveSettings() upserts the real row on first save.
export async function getSettings(): Promise<SettingsData> {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) return DEFAULTS;
  return {
    siteName: row.siteName,
    notificationEmail: row.notificationEmail,
    alsoNotify: row.alsoNotify,
    autoReplyMessage: row.autoReplyMessage,
    sendAutoReply: row.sendAutoReply,
    gaMeasurementId: row.gaMeasurementId,
    gaEnabled: row.gaEnabled,
  };
}

export { SETTINGS_ID };
