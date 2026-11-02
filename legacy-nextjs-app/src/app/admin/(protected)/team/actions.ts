"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTeam, ROLES, type Role } from "@/lib/roles";
import { sendMail } from "@/lib/mailer";
import { inviteSchema, MAX_TEAM_SEATS } from "@/lib/team-schema";

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type ActionResult = { ok: true } | { ok: false; error: string };

// README: "Enforce these permissions on the server, not just in the
// interface." Same pattern as requireEnquiryAccess() in
// src/app/admin/(protected)/enquiries/actions.ts.
async function requireTeamAccess() {
  const session = await auth();
  if (!session || !canAccessTeam(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

async function siteBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? (process.env.VERCEL ? "https" : "http");
  return `${protocol}://${host}`;
}

// Returns a result object instead of throwing on expected failures (full
// seats, duplicate email) — Next.js redacts thrown Server Action error
// messages in production, so the specific reason wouldn't reach the client
// (see TeamView's handleInvite for how this is surfaced).
export async function inviteMember(formData: FormData): Promise<ActionResult> {
  await requireTeamAccess();

  const parsed = inviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invite" };
  }
  const { name, email, role } = parsed.data;

  const seatCount = await prisma.user.count();
  if (seatCount >= MAX_TEAM_SEATS) {
    return { ok: false, error: `All ${MAX_TEAM_SEATS} seats are in use` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "That email is already a team member" };
  }

  await prisma.user.create({
    data: { name, email, role, invitedAt: new Date() },
  });

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + INVITE_TOKEN_TTL_MS);
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

  const url = `${await siteBaseUrl()}/admin/accept-invite?token=${token}`;
  try {
    await sendMail({
      to: email,
      subject: "You're invited to the Kargatox admin panel",
      text: `Hi ${name},\n\nYou've been invited as ${role} on the Kargatox admin panel. Set your password to accept the invite:\n${url}\n\nThis link expires in 7 days.`,
    });
  } catch (err) {
    // The invite is already created — a flaky SMTP send shouldn't undo it or
    // fail the request (same save-first-then-best-effort-email pattern as
    // sendReply in the Enquiries actions).
    console.error("[team] inviteMember sendMail failed:", err);
  }

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function updateMemberRole(userId: string, role: Role): Promise<ActionResult> {
  await requireTeamAccess();
  if (!ROLES.includes(role)) {
    return { ok: false, error: "Invalid role" };
  }

  // Owner is a single, seeded role (see prisma/schema.prisma's User model) —
  // block both changing it away from and promoting another member into it.
  if (role === "OWNER") {
    return { ok: false, error: "Can't promote a member to Owner" };
  }
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "Member not found" };
  if (target.role === "OWNER") {
    return { ok: false, error: "Can't change the Owner's role" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/team");
  return { ok: true };
}

export async function removeMember(userId: string): Promise<ActionResult> {
  await requireTeamAccess();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "Member not found" };
  // README: "The Owner cannot be removed."
  if (target.role === "OWNER") {
    return { ok: false, error: "The Owner can't be removed" };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/team");
  return { ok: true };
}
