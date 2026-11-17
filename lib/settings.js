// Ported from legacy-nextjs-app/src/lib/settings.ts. Same "no row yet = defaults"
// pattern as lib/page-content-defaults.js's mergePublishedPage() — no seeding needed,
// routes/admin.js's Settings POST handler upserts the real row on first save.
const { prisma } = require("./db");

const SETTINGS_ID = "singleton";

const SETTINGS_DEFAULTS = {
  siteName: "Kargatox",
  notificationEmail: null,
  alsoNotify: null,
  autoReplyMessage:
    "Hi {firstName},\n\nThank you for your requirement. Our team will contact you shortly.\n\n— Kargatox",
  sendAutoReply: true,
  gaMeasurementId: null,
  gaEnabled: false,
};

async function getSettings() {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  return row || SETTINGS_DEFAULTS;
}

module.exports = { SETTINGS_ID, SETTINGS_DEFAULTS, getSettings };
