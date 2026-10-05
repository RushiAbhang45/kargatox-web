import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login/verify",
    error: "/admin/login",
  },
  providers: [
    Nodemailer({
      // No Resend/SMTP key yet (src/lib/email.ts is the same stub pattern) —
      // logging the link lets sign-in work end to end without one. `server`
      // is a dummy value: the provider factory throws at startup if it's
      // missing, but our sendVerificationRequest override below fully
      // replaces the default nodemailer-transport one and never reads it.
      server: "smtp://localhost:1025",
      sendVerificationRequest({ identifier, url }) {
        console.log(`[auth] Magic link for ${identifier}: ${url}`);
      },
    }),
  ],
  callbacks: {
    // Team invites (build step 8) don't exist yet, so there's no self-serve
    // way to become a User. Without this, Auth.js's adapter would silently
    // create a brand-new (SALES-role) account for *any* email that completes
    // the magic-link flow. Only pre-existing rows (seeded via `npm run
    // db:seed`, or added directly for now) may sign in.
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      return Boolean(existing);
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
