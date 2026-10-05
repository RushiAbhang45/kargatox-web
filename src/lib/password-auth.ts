import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days, matches Auth.js's own default

// Matches @auth/core's defaultCookies() (node_modules/@auth/core/lib/utils/cookie.js)
// exactly, so a session created here is indistinguishable from one Auth.js
// creates for the magic-link flow — auth() reads it the same way either way.
const USE_SECURE_COOKIES = !!process.env.VERCEL;
const SESSION_COOKIE_NAME = USE_SECURE_COOKIES ? "__Secure-authjs.session-token" : "authjs.session-token";

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Deliberately not using Auth.js's own Credentials provider here — it
// requires JWT sessions, which conflicts with the "database" strategy the
// magic-link flow relies on (see prisma/schema.prisma's User.password
// comment). Instead this creates the exact same kind of `Session` row
// Auth.js's adapter would (same crypto.randomUUID() token shape, same
// cookie name/attributes), so the rest of the app — auth(), the session
// callback, the (protected) layout's check — needs no changes at all.
export async function createPasswordSession(userId: string) {
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: USE_SECURE_COOKIES,
    expires,
  });
}
