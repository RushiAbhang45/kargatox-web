"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

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
