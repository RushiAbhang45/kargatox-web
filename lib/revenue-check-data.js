// Ported from legacy-nextjs-app/src/components/home/revenue-check.tsx (QUESTIONS/RESULTS
// and the meter constants) and src/lib/revenue-check-schema.ts (zod swapped for a plain
// validateRevenueCheck(), same "null means valid" shape as lib/enquiry-schema.js). The
// question/result copy was written by the designer, not taken from the client's PDF (see
// the design handoff README) — the client should review it.
const AREA_KEYS = ["leads", "sales", "retention"];

const QUESTIONS = [
  {
    key: "leads",
    area: "Leads",
    text: "How predictable is your lead flow?",
    options: [
      ["Steady and growing", 2],
      ["Up and down month to month", 1],
      ["Mostly referrals or luck", 0],
    ],
  },
  {
    key: "sales",
    area: "Sales",
    text: "How many qualified leads turn into customers?",
    options: [
      ["Most of them", 2],
      ["Some, but deals stall", 1],
      ["We don't track this", 0],
    ],
  },
  {
    key: "retention",
    area: "Retention",
    text: "How many customers come back or renew?",
    options: [
      ["Most of them", 2],
      ["Some of them", 1],
      ["We rarely hear from them again", 0],
    ],
  },
];

const RESULTS = {
  leads: {
    title: "Your biggest gap is lead flow.",
    body: "Fewer qualified people are finding you than your business can handle. We would start with search visibility and social engagement so demand becomes predictable.",
    services: ["SEO Services", "Social Media Marketing"],
    service: "SEO Services",
  },
  sales: {
    title: "Your biggest gap is conversion.",
    body: "Leads are coming in but not closing. We would study won and lost customers and your numbers to find where deals stall, then fix the sales motion.",
    services: ["Consumer Behaviour & Satisfaction Analysis", "Campaign Analytics"],
    service: "Campaign Analytics",
  },
  retention: {
    title: "Your biggest gap is retention.",
    body: "Customers are not coming back often enough. We would decode why they leave, then build retention systems and campaigns that keep them engaged.",
    services: ["Consumer Behaviour & Satisfaction Analysis", "Brand Campaigns Strategy"],
    service: "Brand Campaigns Strategy",
  },
};

const ALL_HEALTHY_TITLE = "You're in good shape. Let's find the next lever.";
const NOTE_PREFIX = "Revenue check result: ";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const isScore = (v) => v === 0 || v === 1 || v === 2;

function validateRevenueCheck(input) {
  const errors = {};
  AREA_KEYS.forEach((k) => {
    if (!isScore(input[k])) errors[k] = "Must be 0, 1 or 2";
  });
  if (!AREA_KEYS.includes(input.weakest)) errors.weakest = "Invalid area";
  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 100) errors.sessionId = "Invalid session";
  if (input.email != null && input.email !== "" && !EMAIL_PATTERN.test(String(input.email).trim())) {
    errors.email = "Invalid email";
  }
  return Object.keys(errors).length ? errors : null;
}

module.exports = { AREA_KEYS, QUESTIONS, RESULTS, ALL_HEALTHY_TITLE, NOTE_PREFIX, validateRevenueCheck };
