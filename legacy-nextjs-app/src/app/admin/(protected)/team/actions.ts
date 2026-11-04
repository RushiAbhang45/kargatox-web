"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTeam, ROLES, type Role } from "@/lib/roles";
import { sendMail } from "@/lib/mailer";
import { hashPassword } from "@/lib/password-auth";
import { inviteSchema, MAX_TEAM_SEATS } from "@/lib/team-schema";

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
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invite" };
  }
  const { name, email, password, role } = parsed.data;

  const seatCount = await prisma.user.count();
  if (seatCount >= MAX_TEAM_SEATS) {
    return { ok: false, error: `All ${MAX_TEAM_SEATS} seats are in use` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "That email is already a team member" };
  }

  // The admin sets the password directly — no verification token, no email
  // dependency to make the account usable; setting acceptedAt here is what
  // moves the member out of TeamView's "Invited — pending" state.
  const hash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, role, password: hash, invitedAt: new Date(), acceptedAt: new Date() },
  });

  const url = `${await siteBaseUrl()}/admin/login`;
  try {
    await sendMail({
      to: email,
      subject: "Your Kargatox admin account is ready",
      text: `Hi ${name},\n\nAn admin account has been created for you on the Kargatox admin panel as ${role}. Sign in with your email and the password your admin shared with you:\n${url}`,
    });
  } catch (err) {
    // The account is already created — a flaky SMTP send shouldn't undo it
    // or fail the request (same save-first-then-best-effort-email pattern as
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

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "Member not found" };

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/team");
  return { ok: true };
}

export async function removeMember(userId: string): Promise<ActionResult> {
  await requireTeamAccess();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "Member not found" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/team");
  return { ok: true };
}
