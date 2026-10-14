import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// No providers: sign-in is handled entirely outside Auth.js's own flow by
// signInWithPassword() in src/app/admin/login/actions.ts, which creates a
// Session row + cookie directly (see src/lib/password-auth.ts). The adapter
// and "database" session strategy are still needed so auth() can read those
// sessions back; `handlers`/`auth`/`signOut` below are what the rest of the
// app (the API route, the (protected) layout's session check, the sidebar's
// sign-out form) uses.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
