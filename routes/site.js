const express = require("express");
const { PAGE_DEFAULTS } = require("../lib/page-content-defaults");
const { splitFirstSentence, splitLastWord } = require("../lib/text-split");
const { FAQ_DEFAULTS } = require("../lib/faq-defaults");
const { SERVICE_PAGES, getServicePage, getRelatedServicePages } = require("../lib/service-pages-data");
const seo = require("../lib/seo-data");

const router = express.Router();

// Phase 1: hardcoded PAGE_DEFAULTS only — Phase 2 swaps these five handlers' `content`
// for the real DB-backed getPublishedPageContent() merge.

router.get("/", (req, res) => {
  const content = PAGE_DEFAULTS.home;
  const [capabilitiesPlain, capabilitiesAccent] = splitFirstSentence(content.capabilitiesHeading);
  const meta = {
    title: "Kargatox | Research & Marketing Agency in Pune, India",
    description:
      "Kargatox is a Pune research and marketing agency helping founders across India with market research, customer insight, SEO and campaigns.",
    path: "/",
    jsonLd: seo.graph([seo.ORGANIZATION, seo.WEBSITE, seo.pageEntry("WebPage", { path: "/", name: "Kargatox | Research & Marketing Agency in Pune, India", description: "Kargatox is a Pune research and marketing agency helping founders across India with market research, customer insight, SEO and campaigns." })]),
  };
  res.render("site/home", { content, capabilitiesPlain, capabilitiesAccent, meta });
});

router.get("/about-us", (req, res) => {
  const title = "About Kargatox | Research & Marketing Agency in Pune";
  const description =
    "Kargatox is a founder-led research and marketing agency in Pimple Saudagar, Pune, helping Indian businesses grow with insight, SEO and campaigns.";
  const meta = {
    title,
    description,
    path: "/about-us",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("AboutPage", {
        path: "/about-us",
        name: title,
        description,
        extra: { breadcrumb: { "@id": seo.SITE_URL + "/about-us#breadcrumb" } },
      }),
      seo.breadcrumb("/about-us", [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about-us" },
      ]),
    ]),
  };
  res.render("site/about-us", { meta });
});

router.get("/services", (req, res) => {
  const title = "Research & Marketing Services in India | Kargatox";
  const description =
    "Explore Kargatox services: market research, consumer behaviour analysis, campaign analytics, SEO, social media marketing and brand campaigns.";
  const meta = {
    title,
    description,
    path: "/services",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("CollectionPage", {
        path: "/services",
        name: title,
        description,
        extra: {
          breadcrumb: { "@id": seo.SITE_URL + "/services#breadcrumb" },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: SERVICE_PAGES.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.navTitle,
              url: `${seo.SITE_URL}/${p.slug}`,
            })),
          },
        },
      }),
      seo.breadcrumb("/services", [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ]),
    ]),
  };
  res.render("site/services", { content: PAGE_DEFAULTS.services, meta });
});

router.get("/how-we-work", (req, res) => {
  const title = "How We Work | Our 5-Step Growth Process | Kargatox";
  const description =
    "See how Kargatox works: five clear steps from discovery and diagnosis to building, fixing and handing over a growth system your team owns.";
  const meta = {
    title,
    description,
    path: "/how-we-work",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("WebPage", {
        path: "/how-we-work",
        name: title,
        description,
        extra: { breadcrumb: { "@id": seo.SITE_URL + "/how-we-work#breadcrumb" } },
      }),
      seo.breadcrumb("/how-we-work", [
        { name: "Home", path: "/" },
        { name: "How we work", path: "/how-we-work" },
      ]),
    ]),
  };
  res.render("site/how-we-work", { content: PAGE_DEFAULTS["how-we-work"], meta });
});

router.get("/faq", (req, res) => {
  const content = PAGE_DEFAULTS.faq;
  const [headingPlain, headingAccent] = splitFirstSentence(content.heading);
  const title = "FAQ | Kargatox Research & Marketing Agency, Pune";
  const description =
    "Straight answers about Kargatox: what we do, how fast we start, whether we replace a full-time hire and what our engagements cost.";
  const meta = {
    title,
    description,
    path: "/faq",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      Object.assign(seo.faqSchema("/faq", FAQ_DEFAULTS, { nested: false, name: title, description }), {
        breadcrumb: { "@id": seo.SITE_URL + "/faq#breadcrumb" },
      }),
      seo.breadcrumb("/faq", [
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ]),
    ]),
  };
  res.render("site/faq", { content, headingPlain, headingAccent, faqItems: FAQ_DEFAULTS, meta });
});

router.get("/contact", (req, res) => {
  const content = PAGE_DEFAULTS.contact;
  const [headingPlain, headingAccent] = splitLastWord(content.heading);
  const title = "Contact Kargatox | Research & Marketing Agency, Pune";
  const description =
    "Contact Kargatox in Pimple Saudagar, Pune. Call +91 78877 89471 or email Kargatox@gmail.com for market research, SEO and marketing services.";
  const meta = {
    title,
    description,
    path: "/contact",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("ContactPage", {
        path: "/contact",
        name: title,
        description,
        extra: { breadcrumb: { "@id": seo.SITE_URL + "/contact#breadcrumb" } },
      }),
      seo.breadcrumb("/contact", [
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ]),
  };
  res.render("site/contact", { content, headingPlain, headingAccent, meta });
});

// One shared template for all 6 service-landing pages — explicit slug list, not a
// catch-all, so an unrelated unknown path falls through to the 404 handler instead of
// rendering with undefined content.
const SERVICE_SLUGS = new Set(SERVICE_PAGES.map((p) => p.slug));

router.get("/:slug", (req, res, next) => {
  if (!SERVICE_SLUGS.has(req.params.slug)) return next();
  const content = getServicePage(req.params.slug);
  const related = getRelatedServicePages(content);
  const path = "/" + content.slug;
  const meta = {
    title: content.metaTitle,
    description: content.metaDescription,
    path,
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("WebPage", {
        path,
        name: content.metaTitle,
        description: content.metaDescription,
        extra: {
          breadcrumb: { "@id": seo.SITE_URL + path + "#breadcrumb" },
          mainEntity: { "@id": seo.SITE_URL + path + "#service" },
        },
      }),
      seo.breadcrumb(path, [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: content.navTitle, path },
      ]),
      seo.serviceSchema(content),
      seo.faqSchema(path, content.faqs, { nested: true }),
    ]),
  };
  res.render("site/service-landing", { content, related, meta });
});

router.get("/blog", (req, res) => {
  const title = "Kargatox Blog | Market Research & Marketing Insights";
  const description =
    "Insights, case studies and updates from Kargatox on market research, consumer behaviour, SEO, social media and brand campaigns in India.";
  const meta = {
    title,
    description,
    path: "/blog",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("CollectionPage", {
        path: "/blog",
        name: title,
        description,
        extra: { breadcrumb: { "@id": seo.SITE_URL + "/blog#breadcrumb" } },
      }),
      seo.breadcrumb("/blog", [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    ]),
  };
  res.render("site/blog-list", { meta });
});

router.get("/blog/:slug", (req, res) => {
  res.render("site/blog-post", { slug: req.params.slug });
});

module.exports = router;
