"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, createPasswordSession } from "@/lib/password-auth";

const MIN_PASSWORD_LENGTH = 8;

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    redirect("/admin/accept-invite?error=InvalidToken");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(`/admin/accept-invite?token=${token}&error=WeakPassword`);
  }
  if (password !== confirmPassword) {
    redirect(`/admin/accept-invite?token=${token}&error=PasswordMismatch`);
  }

  const verification = await prisma.verificationToken.findFirst({ where: { token } });
  if (!verification || verification.expires < new Date()) {
    redirect("/admin/accept-invite?error=InvalidToken");
  }

  const user = await prisma.user.findUnique({ where: { email: verification.identifier } });
  if (!user) {
    redirect("/admin/accept-invite?error=InvalidToken");
  }

  const hash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hash, acceptedAt: new Date() } }),
    prisma.verificationToken.deleteMany({
      where: { identifier: verification.identifier, token: verification.token },
    }),
  ]);

  // Sets lastActiveAt too (src/lib/password-auth.ts's createPasswordSession).
  await createPasswordSession(user.id);
  redirect("/admin");
}
