"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createPasswordSession } from "@/lib/password-auth";
import { rateLimit } from "@/lib/rate-limit";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/admin/login?error=MissingEmail");
  }

  try {
    await signIn("nodemailer", { email, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=${error.type}`);
    }
    throw error;
  }

  redirect("/admin/login/verify");
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const { allowed } = rateLimit(`admin-password-login:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_WINDOW_MS);
  if (!allowed) {
    redirect("/admin/login?error=TooManyAttempts");
  }

  if (!email || !password) {
    redirect("/admin/login?error=CredentialsSignin");
  }

  // Same generic error for "no such user", "no password set", and "wrong
  // password" — don't let the response shape confirm which emails exist.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password || !(await verifyPassword(password, user.password))) {
    redirect("/admin/login?error=CredentialsSignin");
  }

  await createPasswordSession(user.id);
  redirect("/admin");
}
