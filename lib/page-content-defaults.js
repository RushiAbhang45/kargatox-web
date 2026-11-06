// Ported from legacy-nextjs-app/src/lib/page-content-defaults.ts. PAGE_DEFAULTS is the
// exact hardcoded copy each public page renders until a PageContent DB row exists
// (Phase 2 wires the DB-backed merge — this file is the fallback half of that).
// PAGE_LABELS/PAGE_ROUTES/PAGE_FIELDS drive the admin Pages editor (routes/admin.js) —
// added alongside PAGE_KEYS/PAGE_DEFAULTS rather than as a separate file since the legacy
// source keeps all five in one module too.
const PAGE_KEYS = ["home", "services", "how-we-work", "faq", "contact"];

const PAGE_LABELS = {
  home: "Home",
  services: "Services",
  "how-we-work": "How we work",
  faq: "FAQ",
  contact: "Contact",
};

// The live public route each page's Publish button links to.
const PAGE_ROUTES = {
  home: "/",
  services: "/services",
  "how-we-work": "/how-we-work",
  faq: "/faq",
  contact: "/contact",
};

const PAGE_FIELDS = {
  home: [
    { key: "heroHeadline", label: "Hero headline" },
    { key: "heroSubheading", label: "Hero subheading", multiline: true },
    { key: "capabilitiesHeading", label: "Capabilities heading" },
    { key: "capabilitiesBody", label: "Capabilities body", multiline: true },
  ],
  services: [
    { key: "introHeadline", label: "Intro headline" },
    { key: "introParagraph1", label: "Intro paragraph 1", multiline: true },
    { key: "introParagraph2", label: "Intro paragraph 2", multiline: true },
  ],
  "how-we-work": [
    { key: "headline", label: "Headline (second line on its own — separate with a blank line)", multiline: true },
    { key: "subline", label: "Subline" },
    { key: "straightUpNote", label: 'Straight-up note (after the "Straight up:" label)', multiline: true },
  ],
  faq: [{ key: "heading", label: "Heading" }],
  contact: [
    { key: "heading", label: "Heading" },
    { key: "intro", label: "Intro", multiline: true },
  ],
};

const PAGE_DEFAULTS = {
  home: {
    heroHeadline: "Built On Research. Measured In Growth.",
    heroSubheading:
      "We help founders and leadership teams understand their market, decode their customers, and turn that insight into campaigns that move revenue — across India",
    capabilitiesHeading: "Two Disciplines. One Growth Engine.",
    capabilitiesBody:
      "Kargatox runs on two disciplines working together: research that tells you who your market actually is, and marketing built to reach them. We find the gap, design the fix, and stay close enough to the data to know it's working.",
  },
  services: {
    introHeadline: "Research tells you what's true. We build the marketing that acts on it.",
    introParagraph1:
      "We start by figuring out what's actually happening — in your market, with your customers, inside your funnel. Guesswork is expensive, and most engagements here begin by replacing it with evidence.",
    introParagraph2:
      "From there, every recommendation ships with a number attached. You'll always know what we're doing, why we're doing it, and what it's meant to move for your business.",
  },
  "how-we-work": {
    headline: "We do the work.\nYou keep the system.",
    subline: "Here is exactly what happens after you say yes.",
    straightUpNote: "If we are not the right fix for your problem, we will tell you on the first call.",
  },
  faq: {
    heading: "You have questions. We have straight answers.",
  },
  contact: {
    heading: "Initiate a Project",
    intro:
      "Connect with our team to discuss your specific research, data structuring, or lead generation requirements. We will review your scope and provide a structured proposal.",
  },
};

module.exports = { PAGE_KEYS, PAGE_LABELS, PAGE_ROUTES, PAGE_FIELDS, PAGE_DEFAULTS };
