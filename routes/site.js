const express = require("express");
const { PAGE_DEFAULTS } = require("../lib/page-content-defaults");
const { splitFirstSentence, splitLastWord } = require("../lib/text-split");
const { FAQ_DEFAULTS } = require("../lib/faq-defaults");
const { SERVICE_PAGES, getServicePage, getRelatedServicePages } = require("../lib/service-pages-data");

const router = express.Router();

// Phase 1: hardcoded PAGE_DEFAULTS only — Phase 2 swaps these five handlers' `content`
// for the real DB-backed getPublishedPageContent() merge.

router.get("/", (req, res) => {
  const content = PAGE_DEFAULTS.home;
  const [capabilitiesPlain, capabilitiesAccent] = splitFirstSentence(content.capabilitiesHeading);
  res.render("site/home", { content, capabilitiesPlain, capabilitiesAccent });
});

router.get("/services", (req, res) => {
  res.render("site/services", { content: PAGE_DEFAULTS.services });
});

router.get("/how-we-work", (req, res) => {
  res.render("site/how-we-work", { content: PAGE_DEFAULTS["how-we-work"] });
});

router.get("/faq", (req, res) => {
  const content = PAGE_DEFAULTS.faq;
  const [headingPlain, headingAccent] = splitFirstSentence(content.heading);
  res.render("site/faq", { content, headingPlain, headingAccent, faqItems: FAQ_DEFAULTS });
});

router.get("/contact", (req, res) => {
  const content = PAGE_DEFAULTS.contact;
  const [headingPlain, headingAccent] = splitLastWord(content.heading);
  res.render("site/contact", { content, headingPlain, headingAccent });
});

// One shared template for all 6 service-landing pages — explicit slug list, not a
// catch-all, so an unrelated unknown path falls through to the 404 handler instead of
// rendering with undefined content.
const SERVICE_SLUGS = new Set(SERVICE_PAGES.map((p) => p.slug));

router.get("/:slug", (req, res, next) => {
  if (!SERVICE_SLUGS.has(req.params.slug)) return next();
  const content = getServicePage(req.params.slug);
  const related = getRelatedServicePages(content);
  res.render("site/service-landing", { content, related });
});

router.get("/blog", (req, res) => {
  res.render("site/blog-list");
});

router.get("/blog/:slug", (req, res) => {
  res.render("site/blog-post", { slug: req.params.slug });
});

module.exports = router;
