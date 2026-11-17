// Ported from legacy-nextjs-app/src/lib/enquiry-schema.ts, with zod swapped for a plain
// validateEnquiry() function (no zod dependency in this app) — same pattern as
// lib/post-schema.js's validatePost(). SERVICE_OPTIONS is read by both the public
// Contact form's <select> (routes/site.js's `/contact` handler passes it to
// views/site/contact.ejs) and the validation below, so the two can't drift apart.
const SERVICE_OPTIONS = [
  "General Inquiry",
  "Market Research",
  "Consumer Behaviour & Satisfaction Analysis",
  "Campaign Analytics",
  "SEO Services",
  "Social Media Marketing",
  "Brand Campaigns Strategy",
];

const ENQUIRY_SOURCES = ["Contact form", "Revenue check"];

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// Returns a { field: message } map of problems, or null if `input` is a valid
// submission — same "null means valid" shape as lib/post-schema.js's validatePost().
function validateEnquiry(input) {
  const errors = {};
  if (!String(input.name || "").trim()) errors.name = "Please enter your name";
  if (!EMAIL_PATTERN.test(String(input.email || "").trim())) errors.email = "Please enter a valid email";
  if (!SERVICE_OPTIONS.includes(input.service)) errors.service = "Please choose a valid service";
  if (!String(input.details || "").trim()) errors.details = "Please tell us a little about your requirements";
  if (!ENQUIRY_SOURCES.includes(input.source)) errors.source = "Invalid source";
  return Object.keys(errors).length ? errors : null;
}

module.exports = { SERVICE_OPTIONS, ENQUIRY_SOURCES, validateEnquiry };
