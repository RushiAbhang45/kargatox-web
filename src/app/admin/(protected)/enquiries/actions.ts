"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessEnquiries } from "@/lib/roles";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry-status";
import { sendMail } from "@/lib/mailer";

// README: "Enforce these permissions on the server, not just in the
// interface." Every mutation below re-checks the session itself rather than
// trusting that the UI only shows these controls to allowed roles.
async function requireEnquiryAccess() {
  const session = await auth();
  if (!session || !canAccessEnquiries(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}

export async function updateEnquiryStatus(enquiryId: string, status: EnquiryStatus) {
  await requireEnquiryAccess();
  if (!ENQUIRY_STATUSES.includes(status)) throw new Error("Invalid status");
  await prisma.enquiry.update({ where: { id: enquiryId }, data: { status } });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function assignEnquiry(enquiryId: string, ownerId: string | null) {
  await requireEnquiryAccess();
  await prisma.enquiry.update({ where: { id: enquiryId }, data: { ownerId } });
  revalidatePath("/admin/enquiries");
}

export async function sendReply(enquiryId: string, body: string) {
  const session = await requireEnquiryAccess();
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Reply can't be empty");

  const enquiry = await prisma.enquiry.findUniqueOrThrow({ where: { id: enquiryId } });

  await prisma.enquiryMessage.create({
    data: { enquiryId, body: trimmed, senderId: session.user.id },
  });
  // README: "If the enquiry was New, it moves to Contacted."
  if (enquiry.status === "NEW") {
    await prisma.enquiry.update({ where: { id: enquiryId }, data: { status: "CONTACTED" } });
  }

  // The reply is already saved and the status already updated — don't let a
  // flaky SMTP connection surface as a failed reply (and risk a duplicate on retry).
  try {
    await sendMail({
      to: enquiry.email,
      subject: `Re: your enquiry — Kargatox`,
      text: trimmed,
    });
  } catch (err) {
    console.error("[enquiries] sendReply sendMail failed:", err);
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}
