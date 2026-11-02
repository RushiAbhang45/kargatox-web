// README's Pages admin spec lists exactly these fields per page. Defaults
// below are the exact current hardcoded copy from each public page component
// — used both to pre-fill the admin editor and as the fallback the public
// pages render before any PageContent row exists / for any field a row is
// missing (see src/lib/page-content.ts's getPublishedPageContent()).
export const PAGE_KEYS = ["home", "services", "how-we-work", "faq", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  services: "Services",
  "how-we-work": "How we work",
  faq: "FAQ",
  contact: "Contact",
};

// The live public route each page's Publish button revalidates.
export const PAGE_ROUTES: Record<PageKey, string> = {
  home: "/",
  services: "/services",
  "how-we-work": "/how-we-work",
  faq: "/faq",
  contact: "/contact",
};

export type PageFieldDef = { key: string; label: string; multiline?: boolean };

export const PAGE_FIELDS: Record<PageKey, PageFieldDef[]> = {
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
    { key: "straightUpNote", label: "Straight-up note (after the \"Straight up:\" label)", multiline: true },
  ],
  faq: [{ key: "heading", label: "Heading" }],
  contact: [
    { key: "heading", label: "Heading" },
    { key: "intro", label: "Intro", multiline: true },
  ],
};

export const PAGE_DEFAULTS: Record<PageKey, Record<string, string>> = {
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
