// Phase 3: the public Contact form's real submit endpoint. Mirrors the already-reviewed
// legacy-nextjs-app/src/app/api/enquiries/route.ts: same per-IP rate limit, same
// honeypot short-circuit, same "save first, email second" ordering so a flaky SMTP
// connection can't turn an already-saved enquiry into a user-visible failure.
//
// Client change list 2026-11-02 ("make the Enquiry page DDoS-attack proof") added more
// layers, cheapest first, so junk is turned away before it costs a DB write or an email:
//   1. Request bodies over 16 KB are refused (server.js's express.json limit).
//   2. Per-IP (5 / 10 min), per-email (3 / hour) and per-instance (60 / 10 min) limits.
//   3. Honeypot field, then a signed form token (lib/form-token.js): no token = the page
//      was never loaded; submitted < 3s after load = a bot.
//   4. Optional Cloudflare Turnstile (only when TURNSTILE_SECRET_KEY is set).
//   5. Field validation, then the email domain check (lib/email-check.js).
// Volumetric DDoS (floods of traffic, not form spam) has to be absorbed in front of the
// app — Vercel's firewall / Attack Challenge Mode or Cloudflare — no app code can do it.
const express = require("express");
const { waitUntil } = require("@vercel/functions");
const { prisma } = require("../lib/db");
const { normalizeEnquiry } = require("../lib/enquiry-schema");
const { rateLimit } = require("../lib/rate-limit");
const { sendEnquiryEmails } = require("../lib/enquiry-mail");
const { checkEmailDomain } = require("../lib/email-check");
const { checkFormToken } = require("../lib/form-token");
const { scanEnquiryWebsite } = require("../lib/site-scan");
const { AREA_KEYS, validateRevenueCheck } = require("../lib/revenue-check-data");

const router = express.Router();

function clientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.ip ||
    "unknown"
  );
}

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const TOO_MANY = { error: "Too many requests. Please try again later." };

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("[enquiries] Turnstile verification failed:", err && err.message);
    return true; // Cloudflare outage — fall back to the other layers rather than block everyone
  }
}

router.post("/enquiries", async (req, res) => {
  const ip = clientIp(req);

  if (!rateLimit(`enquiry:${ip}`, RATE_LIMIT, RATE_WINDOW_MS).allowed) return res.status(429).json(TOO_MANY);
  if (!rateLimit("enquiry:all", 60, RATE_WINDOW_MS).allowed) return res.status(429).json(TOO_MANY);

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real users never see this field (visually hidden + out of tab order in
  // the form, see views/site/contact.ejs). A filled value means a bot filled every
  // input it could find — pretend success without saving or emailing anything.
  if (typeof body.company === "string" && body.company) {
    return res.status(201).json({ ok: true });
  }

  const tokenProblem = checkFormToken(body.formToken);
  if (tokenProblem === "too-fast") return res.status(201).json({ ok: true }); // bot: same silent fake success
  if (tokenProblem) {
    return res.status(400).json({ error: "This form has expired. Please refresh the page and try again." });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return res.status(400).json({ error: "Please complete the verification check and try again." });
  }

  const { values, errors } = normalizeEnquiry({ ...body, source: body.source || "Contact form" });
  if (errors) {
    return res.status(400).json({ error: "Please check the highlighted fields.", fieldErrors: errors });
  }

  if (!rateLimit(`enquiry-email:${values.email}`, 3, 60 * 60 * 1000).allowed) {
    return res.status(429).json({ error: "We've already received several enquiries from this email. We'll be in touch soon." });
  }

  const emailProblem = await checkEmailDomain(values.email);
  if (emailProblem) {
    return res.status(400).json({ error: "Please check the highlighted fields.", fieldErrors: { email: emailProblem } });
  }

  // A client-supplied id, so don't trust it as a valid FK — a stale or tampered value
  // should drop the link, not fail the whole submission.
  const revenueCheckId = typeof body.revenueCheckId === "string" ? body.revenueCheckId : null;
  const revenueCheck = revenueCheckId
    ? await prisma.revenueCheck.findUnique({ where: { id: revenueCheckId }, select: { id: true } })
    : null;

  const enquiry = await prisma.enquiry.create({
    data: {
      ...values,
      status: "NEW",
      revenueCheckId: revenueCheck ? revenueCheck.id : null,
      siteAuditStatus: values.website ? "PENDING" : null,
    },
  });

  try {
    await sendEnquiryEmails({ id: enquiry.id, ...values });
  } catch (err) {
    console.error("[enquiries] sendEnquiryEmails failed:", err);
  }

  // The website scan takes a few seconds (longer with the AI write-up), so it runs after
  // the response is sent. waitUntil keeps the Vercel function alive until it finishes;
  // locally it's just a background promise.
  if (values.website) waitUntil(scanEnquiryWebsite(prisma, enquiry.id, values.website));

  res.status(201).json({ ok: true, id: enquiry.id });
});

// Home page revenue-check quiz (public/js/revenue-check.js) — mirrors the already-reviewed
// legacy-nextjs-app/src/app/api/revenue-checks/route.ts. One difference: `weakest` is
// recomputed here from the scores (lowest score, ties → leads, sales, retention) rather
// than trusted from the client, so a tampered request can't store an inconsistent row.
router.post("/revenue-checks", async (req, res) => {
  const ip = clientIp(req);
  const { allowed } = rateLimit(`revenue-check:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fieldErrors = validateRevenueCheck(body);
  if (fieldErrors) {
    return res.status(400).json({ error: "Invalid submission.", fieldErrors });
  }

  const weakest = AREA_KEYS.reduce((w, k) => (body[k] < body[w] ? k : w), AREA_KEYS[0]);
  const revenueCheck = await prisma.revenueCheck.create({
    data: {
      leads: body.leads,
      sales: body.sales,
      retention: body.retention,
      weakest,
      sessionId: body.sessionId.trim(),
      email: body.email ? String(body.email).trim() : null,
      city: body.city ? String(body.city).trim().slice(0, 100) : null,
    },
  });

  res.status(201).json({ ok: true, id: revenueCheck.id });
});

module.exports = router;
