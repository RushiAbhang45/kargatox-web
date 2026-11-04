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

const ORGANIZATION = {
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#organization`,
  name: "Kargatox",
  url: `${SITE_URL}/`,
  logo: LOGO_URL,
  image: LOGO_URL,
  description:
    "Founder-led research and marketing agency in Pune offering market research, consumer behaviour analysis, campaign analytics, SEO, social media marketing and brand campaign strategy.",
  email: "Kargatox@gmail.com",
  telephone: "+91-7887789471",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Coffice 24x7, Sai Vision, Pimple Saudagar",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411027",
    addressCountry: "IN",
  },
  areaServed: { "@type": "Country", name: "India" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-7887789471",
    email: "Kargatox@gmail.com",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English"],
  },
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
    description: servicePage.metaDescription,
    url,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "India" },
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
  ORGANIZATION,
  WEBSITE,
  pageEntry,
  breadcrumb,
  serviceSchema,
  faqSchema,
  graph,
};
