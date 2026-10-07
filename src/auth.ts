import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

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
      // `server` is a dummy value: the provider factory throws at startup if
      // it's missing, but our sendVerificationRequest override below fully
      // replaces the default nodemailer-transport one (which would otherwise
      // read `server`) with src/lib/mailer.ts's SMTP_* config.
      server: "smtp://localhost:1025",
      async sendVerificationRequest({ identifier, url }) {
        await sendMail({
          to: identifier,
          subject: "Sign in to Kargatox Admin",
          text: `Click to sign in: ${url}\n\nIf you didn't request this, you can ignore this email.`,
        });
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
