// Shared SEO/JSON-LD building blocks used by routes/site.js to build each page's
// `meta` object (consumed by views/partials/doc-head.ejs) and by server.js (app.locals
// for the constants doc-head.ejs itself needs directly). Content sourced verbatim from
// the client's SEO upload (meta tags/schema previously hand-spliced into public/*.html
// — see git history around the "SEO content" upload for the original source files).
const { SERVICE_PAGES } = require("./service-pages-data");

const SITE_URL = "https://www.kargatox.com";
const GA_MEASUREMENT_ID = "G-B6FXMCJE9H";
const GOOGLE_SITE_VERIFICATION = "JZYf1EI9iqLl-O7jfd0YjGM5PpkOs11T2nfOelQE7NE";
const LOGO_URL = `${SITE_URL}/images/kargatox-logo.jpg`;

// Microsoft Clarity (session recording/heatmaps) and Calendly (scheduling), both tied to
// the Kargatox@gmail.com account. CLARITY_PROJECT_ID is real (the "Kargatox Knowledge
// Partners" project at clarity.microsoft.com, Settings → Overview). CALENDLY_URL is still
// a PLACEHOLDER — replace with the real scheduling link (calendly.com → an event type's
// "Copy link") once that account/event exists; until then the button/embed will 404
// against Calendly's own site.
const CLARITY_PROJECT_ID = "zddpq7gv8o";
const CALENDLY_URL = "https://calendly.com/kargatox/REPLACE_WITH_EVENT_SLUG";

// Office geo-coordinates (Coffice 24x7, Sai Vision, Pimple Saudagar, Pune) — used both in
// ORGANIZATION's `geo` and directly by doc-head.ejs for the page-level geo.position/ICBM
// meta tags, so there's one source for this pair of numbers.
const GEO_LATITUDE = 18.5925265;
const GEO_LONGITUDE = 73.8015733;

// Fixed content-revision date stamped on every page's OG/JSON-LD dateModified/updated_time
// fields (2026-11-14 SEO content pass) — bump this the next time page content changes
// sitewide, it isn't derived from anything automatically.
const CONTENT_UPDATED_DATE = "2026-11-14";

const ORGANIZATION = {
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Kargatox",
  alternateName: "Kargatox Knowledge Partners",
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: LOGO_URL },
  image: LOGO_URL,
  description:
    "Founder-led research and marketing agency in Pimple Saudagar, Pune offering market research, consumer behaviour analysis, campaign analytics, SEO, social media marketing and brand campaign strategy across India.",
  email: "Kargatox@gmail.com",
  telephone: "+91-7887789471",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Coffice 24x7 (CO-102), Sai Vision, Pimple Saudagar",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411027",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: GEO_LATITUDE, longitude: GEO_LONGITUDE },
  hasMap: ["https://maps.app.goo.gl/NeJyGs6Z2QePoPEL6", "https://maps.google.com/?cid=8221514137395318064"],
  areaServed: [
    { "@type": "City", name: "Pune" },
    { "@type": "State", name: "Maharashtra" },
    { "@type": "Country", name: "India" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-7887789471",
    email: "Kargatox@gmail.com",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Marathi"],
  },
  knowsAbout: [
    "Market Research",
    "Consumer Behaviour Analysis",
    "Customer Satisfaction Analysis",
    "Campaign Analytics",
    "Search Engine Optimization",
    "Generative Engine Optimization",
    "Social Media Marketing",
    "Brand Campaign Strategy",
    "ERP Development",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kargatox Services",
    itemListElement: SERVICE_PAGES.map((p) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: p.navTitle, url: `${SITE_URL}/${p.slug}` },
    })),
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: "Kargatox",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
};

// Shared shape behind WebPage/CollectionPage/ContactPage/AboutPage/FAQPage(home-level)
// entries — every page type below just adds its own `extra` fields on top of this.
// `primaryImageOfPage`/`dateModified`/`speakable`/`mainEntity` are the 2026-11-14 SEO-pass
// additions; `extra` is applied last so a caller needing a non-default `mainEntity` (e.g.
// /services' full service ItemList) still overrides the organization-id default below.
function pageEntry(type, { path, name, description, extra }) {
  const url = SITE_URL + path;
  return Object.assign(
    {
      "@type": type,
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: "en-IN",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: LOGO_URL },
      dateModified: CONTENT_UPDATED_DATE,
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "main p"] },
      mainEntity: { "@id": `${SITE_URL}/#organization` },
    },
    extra || {}
  );
}

function breadcrumb(path, items) {
  const url = SITE_URL + path;
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: SITE_URL + item.path,
    })),
  };
}

function serviceSchema(servicePage) {
  const url = `${SITE_URL}/${servicePage.slug}`;
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: servicePage.navTitle,
    serviceType: servicePage.navTitle,
    url,
    description: servicePage.metaDescription,
    provider: { "@id": `${SITE_URL}/#organization` },
    image: LOGO_URL,
    areaServed: [
      { "@type": "City", name: "Pune" },
      { "@type": "Country", name: "India" },
    ],
    audience: { "@type": "BusinessAudience", audienceType: "Founders, SMEs and leadership teams" },
  };
}

// nested: true -> its own minimal #faq entry alongside a separate WebPage entry (used
// by the 6 service-landing pages). nested: false -> the FAQPage IS the page's full
// #webpage entry (name/description/isPartOf/about, like pageEntry) — used by /faq,
// which has no separate WebPage entry of its own.
function faqSchema(path, faqs, { nested, name, description }) {
  const url = SITE_URL + path;
  const mainEntity = faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  }));
  if (nested) {
    return { "@type": "FAQPage", "@id": `${url}#faq`, url, mainEntity };
  }
  return pageEntry("FAQPage", { path, name, description, extra: { mainEntity } });
}

function graph(entries) {
  return { "@context": "https://schema.org", "@graph": entries };
}

module.exports = {
  SITE_URL,
  GA_MEASUREMENT_ID,
  GOOGLE_SITE_VERIFICATION,
  LOGO_URL,
  CLARITY_PROJECT_ID,
  CALENDLY_URL,
  GEO_LATITUDE,
  GEO_LONGITUDE,
  CONTENT_UPDATED_DATE,
  ORGANIZATION,
  WEBSITE,
  pageEntry,
  breadcrumb,
  serviceSchema,
  faqSchema,
  graph,
};
