// Signed "form issued at" token for the Contact form (abuse protection, client change
// list 2026-11-02). views/site/contact.ejs embeds a fresh token on every render; POST
// /api/enquiries rejects submissions whose token is missing, forged, older than
// MAX_AGE_MS, or younger than MIN_FILL_MS. That stops scripts that POST straight to the
// API without loading the page, and bots that fill and submit instantly — neither of
// which the per-IP rate limit or the honeypot catch on their own.
//
// HMAC-SHA256 over AUTH_SECRET (the same secret lib/admin-auth.js signs sessions with).
// With no AUTH_SECRET configured (local dev without an .env), tokens aren't checked.
const crypto = require("crypto");

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function sign(value) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(`contact-form:${value}`).digest("base64url");
}

function issueFormToken(now = Date.now()) {
  if (!process.env.AUTH_SECRET) return "";
  return `${now}.${sign(String(now))}`;
}

// Returns null if the token is acceptable, or a short reason string if not.
function checkFormToken(token, now = Date.now()) {
  if (!process.env.AUTH_SECRET) return null;
  if (typeof token !== "string" || !token.includes(".")) return "missing";
  const [issued, sig] = token.split(".");
  const expected = sign(issued);
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "forged";
  const age = now - Number(issued);
  if (!Number.isFinite(age) || age > MAX_AGE_MS) return "expired";
  if (age < MIN_FILL_MS) return "too-fast";
  return null;
}

module.exports = { issueFormToken, checkFormToken, MIN_FILL_MS };
