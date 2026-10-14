"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSettings } from "@/lib/roles";
import { SETTINGS_ID } from "@/lib/settings";

type ActionResult = { ok: true } | { ok: false; error: string };

type SettingsInput = {
  siteName: string;
  notificationEmail: string;
  alsoNotify: string;
  autoReplyMessage: string;
  sendAutoReply: boolean;
  gaMeasurementId: string;
  gaEnabled: boolean;
};

// Typical format is "G-XXXXXXXXXX" (GA4) — validated since this value gets
// interpolated into an inline <Script> in src/app/(site)/layout.tsx; only
// OWNER/ADMIN can set it, but there's no reason to accept arbitrary text there.
const GA_ID_PATTERN = /^[A-Za-z0-9-]+$/;

async function requireSettingsAccess() {
  const session = await auth();
  if (!session || !canAccessSettings(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  await requireSettingsAccess();

  const gaMeasurementId = input.gaMeasurementId.trim();
  if (gaMeasurementId && !GA_ID_PATTERN.test(gaMeasurementId)) {
    return { ok: false, error: "GA measurement ID can only contain letters, numbers and hyphens" };
  }

  const data = {
    siteName: input.siteName.trim() || "Kargatox",
    notificationEmail: input.notificationEmail.trim() || null,
    alsoNotify: input.alsoNotify.trim() || null,
    autoReplyMessage: input.autoReplyMessage,
    sendAutoReply: input.sendAutoReply,
    gaMeasurementId: gaMeasurementId || null,
    gaEnabled: input.gaEnabled,
  };

  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // GA snippet lives in the (site) layout
  return { ok: true };
}
