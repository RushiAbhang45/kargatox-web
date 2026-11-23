// Ported from legacy-nextjs-app/src/lib/enquiry-schema.ts, with zod swapped for a plain
// validateEnquiry() function (no zod dependency in this app) — same pattern as
// lib/post-schema.js's validatePost(). SERVICE_OPTIONS and COUNTRY_CODES are read by both
// the public Contact form (routes/site.js's `/contact` handler passes them to
// views/site/contact.ejs) and the validation below, so the two can't drift apart.
//
// Client change list 2026-11-02 added: a country-code + digits-only phone number,
// optional LinkedIn profile and website, and a "happy to book a meeting?" choice.
// normalizeEnquiry() returns the cleaned values the route saves, so the route never
// re-derives them from raw input.
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

// Dial codes offered in the Contact form's country picker. `digits` is the allowed
// national-number length range (without the dial code); India is the default.
const COUNTRY_CODES = [
  { iso: "IN", name: "India", dial: "+91", digits: [10, 10] },
  { iso: "US", name: "United States", dial: "+1", digits: [10, 10] },
  { iso: "CA", name: "Canada", dial: "+1", digits: [10, 10] },
  { iso: "GB", name: "United Kingdom", dial: "+44", digits: [9, 10] },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", digits: [8, 9] },
  { iso: "SA", name: "Saudi Arabia", dial: "+966", digits: [8, 9] },
  { iso: "QA", name: "Qatar", dial: "+974", digits: [8, 8] },
  { iso: "OM", name: "Oman", dial: "+968", digits: [8, 8] },
  { iso: "KW", name: "Kuwait", dial: "+965", digits: [8, 8] },
  { iso: "BH", name: "Bahrain", dial: "+973", digits: [8, 8] },
  { iso: "SG", name: "Singapore", dial: "+65", digits: [8, 8] },
  { iso: "MY", name: "Malaysia", dial: "+60", digits: [9, 10] },
  { iso: "AU", name: "Australia", dial: "+61", digits: [9, 9] },
  { iso: "NZ", name: "New Zealand", dial: "+64", digits: [8, 10] },
  { iso: "DE", name: "Germany", dial: "+49", digits: [6, 13] },
  { iso: "FR", name: "France", dial: "+33", digits: [9, 9] },
  { iso: "NL", name: "Netherlands", dial: "+31", digits: [9, 9] },
  { iso: "IE", name: "Ireland", dial: "+353", digits: [7, 9] },
  { iso: "ZA", name: "South Africa", dial: "+27", digits: [9, 9] },
  { iso: "NP", name: "Nepal", dial: "+977", digits: [8, 10] },
  { iso: "BD", name: "Bangladesh", dial: "+880", digits: [10, 10] },
  { iso: "LK", name: "Sri Lanka", dial: "+94", digits: [9, 9] },
  { iso: "OTHER", name: "Other", dial: "", digits: [6, 15] },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX = { name: 120, email: 254, details: 5000, url: 300 };

const str = (v) => (typeof v === "string" ? v.trim() : "");

// Accepts "example.com", "www.example.com/page" or a full http(s) URL; returns the
// normalised absolute URL, "" when empty, or null if it isn't a plausible public web address.
function normalizeWebsite(value) {
  let v = str(value);
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  let u;
  try {
    u = new URL(v);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) return null;
  return u.toString();
}

function normalizeLinkedin(value) {
  const url = normalizeWebsite(value);
  if (url === "" || url === null) return url;
  const host = new URL(url).hostname.toLowerCase();
  return host === "linkedin.com" || host.endsWith(".linkedin.com") ? url : null;
}

// Returns { values, errors } — `errors` is a { field: message } map or null (same "null
// means valid" shape as lib/post-schema.js's validatePost()).
function normalizeEnquiry(input) {
  const errors = {};
  const name = str(input.name);
  const email = str(input.email).toLowerCase();
  const details = str(input.details);

  if (!name) errors.name = "Please enter your name";
  else if (name.length > MAX.name) errors.name = "Please use a shorter name";
  if (!EMAIL_PATTERN.test(email) || email.length > MAX.email) errors.email = "Please enter a valid email";
  if (!SERVICE_OPTIONS.includes(input.service)) errors.service = "Please choose a valid service";
  if (!details) errors.details = "Please tell us a little about your requirements";
  else if (details.length > MAX.details) errors.details = `Please keep this under ${MAX.details} characters`;
  if (!ENQUIRY_SOURCES.includes(input.source)) errors.source = "Invalid source";

  // Phone: optional, digits only, length checked against the chosen country.
  let phone = null;
  const phoneDigits = str(input.phone);
  if (phoneDigits) {
    const country = COUNTRY_CODES.find((c) => c.iso === input.phoneCountry) || COUNTRY_CODES[0];
    const [min, max] = country.digits;
    if (!/^\d+$/.test(phoneDigits)) errors.phone = "Numbers only, please";
    else if (phoneDigits.length < min || phoneDigits.length > max) {
      errors.phone =
        min === max
          ? `${country.name} numbers have ${min} digits`
          : `${country.name} numbers have ${min}–${max} digits`;
    } else phone = country.dial ? `${country.dial} ${phoneDigits}` : phoneDigits;
  }

  const linkedinUrl = normalizeLinkedin(input.linkedinUrl);
  if (linkedinUrl === null || (linkedinUrl && linkedinUrl.length > MAX.url)) {
    errors.linkedinUrl = "Please enter a linkedin.com profile or company link";
  }
  const website = normalizeWebsite(input.website);
  if (website === null || (website && website.length > MAX.url)) {
    errors.website = "Please enter a valid website, e.g. yourcompany.com";
  }

  const values = {
    name,
    email,
    phone,
    service: input.service,
    details,
    source: input.source,
    linkedinUrl: linkedinUrl || null,
    website: website || null,
    wantsMeeting: input.wantsMeeting === true || input.wantsMeeting === "yes",
  };
  return { values, errors: Object.keys(errors).length ? errors : null };
}

// Kept for callers that only need the yes/no answer.
function validateEnquiry(input) {
  return normalizeEnquiry(input).errors;
}

module.exports = {
  SERVICE_OPTIONS,
  ENQUIRY_SOURCES,
  COUNTRY_CODES,
  normalizeEnquiry,
  normalizeWebsite,
  validateEnquiry,
};
