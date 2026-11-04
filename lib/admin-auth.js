// Stateless signed-cookie admin session — no Session table, no extra session-store
// dependency. The cookie holds {id, email, name, role, exp} as base64url JSON, signed
// with an HMAC-SHA256 over AUTH_SECRET; verifySession rejects a missing/invalid
// signature or an expired payload. Deliberately independent of legacy-nextjs-app's
// Auth.js-shaped sessions (different app, different cookie, same underlying User
// table) — simplest thing that actually works for this one app's login.
const crypto = require("crypto");

const SESSION_COOKIE = "kx_admin_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SECURE = !!process.env.VERCEL;

function secretKey() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set — required for admin session signing");
  }
  return process.env.AUTH_SECRET;
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secretKey()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac("sha256", secretKey()).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionCookie(req) {
  const header = req.headers.cookie;
  if (!header) return null;
  const prefix = SESSION_COOKIE + "=";
  const match = header.split(";").map((s) => s.trim()).find((s) => s.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function getSession(req) {
  return verify(getSessionCookie(req));
}

function setSessionCookie(res, user) {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = sign({ id: user.id, email: user.email, name: user.name, role: user.role, exp });
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SECONDS}`,
  ];
  if (SECURE) attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

function clearSessionCookie(res) {
  const attrs = [`${SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"];
  if (SECURE) attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

module.exports = { getSession, setSessionCookie, clearSessionCookie };
