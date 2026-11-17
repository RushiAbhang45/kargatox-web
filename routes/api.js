// Phase 3: the public Contact form's real submit endpoint — the piece CLAUDE.md
// flagged as the one still-missing public-facing piece ("nothing public-facing
// creates an Enquiry row yet"). Mirrors the already-reviewed
// legacy-nextjs-app/src/app/api/enquiries/route.ts: same per-IP rate limit, same
// honeypot short-circuit, same "save first, email second" ordering so a flaky SMTP
// connection can't turn an already-saved enquiry into a user-visible failure.
const express = require("express");
const { prisma } = require("../lib/db");
const { validateEnquiry } = require("../lib/enquiry-schema");
const { rateLimit } = require("../lib/rate-limit");
const { sendEnquiryEmails } = require("../lib/enquiry-mail");

const router = express.Router();

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

router.post("/enquiries", async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.ip ||
    "unknown";

  const { allowed } = rateLimit(`enquiry:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real users never see this field (visually hidden + out of tab order in
  // the form, see views/site/contact.ejs). A filled value means a bot filled every
  // input it could find — pretend success without saving or emailing anything.
  if (typeof body.company === "string" && body.company) {
    return res.status(201).json({ ok: true });
  }

  const input = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    service: body.service,
    details: body.details,
    source: body.source || "Contact form",
  };
  const fieldErrors = validateEnquiry(input);
  if (fieldErrors) {
    return res.status(400).json({ error: "Invalid submission.", fieldErrors });
  }

  // A client-supplied id, so don't trust it as a valid FK — a stale or tampered value
  // should drop the link, not fail the whole submission.
  const revenueCheckId = typeof body.revenueCheckId === "string" ? body.revenueCheckId : null;
  const revenueCheck = revenueCheckId
    ? await prisma.revenueCheck.findUnique({ where: { id: revenueCheckId }, select: { id: true } })
    : null;

  const enquiry = await prisma.enquiry.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone ? String(input.phone).trim() : null,
      service: input.service,
      details: input.details.trim(),
      source: input.source,
      status: "NEW",
      revenueCheckId: revenueCheck ? revenueCheck.id : null,
    },
  });

  try {
    await sendEnquiryEmails({
      name: input.name,
      email: input.email,
      service: input.service,
      details: input.details,
      source: input.source,
    });
  } catch (err) {
    console.error("[enquiries] sendEnquiryEmails failed:", err);
  }

  res.status(201).json({ ok: true, id: enquiry.id });
});

module.exports = router;
