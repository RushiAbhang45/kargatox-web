const express = require("express");
const { prisma } = require("../lib/db");
const { mergePublishedPage } = require("../lib/page-content-defaults");
const { splitFirstSentence, splitLastWord } = require("../lib/text-split");
const { faqItemsFromRows } = require("../lib/faq-defaults");
const { SERVICES, subServicesByKeyFromRows } = require("../lib/services-data");
const { SERVICE_PAGES, getServicePage, getRelatedServicePages } = require("../lib/service-pages-data");
const { STATS, SEO_CASE_STUDY, ERP_CASE_STUDY, AUTHOR, ARTICLES } = require("../lib/clients-data");
const seo = require("../lib/seo-data");

const router = express.Router();

// Phase 2: each page's `content` is PAGE_DEFAULTS merged with its PageContent row's
// `published` JSON, if one exists yet (lib/page-content-defaults.js's mergePublishedPage) —
// same "default until a row exists" pattern the admin Pages editor already uses.

router.get("/", async (req, res) => {
  const row = await prisma.pageContent.findUnique({ where: { page: "home" } });
  const content = mergePublishedPage("home", row);
  const [capabilitiesPlain, capabilitiesAccent] = splitFirstSentence(content.capabilitiesHeading);
  const title = "Kargatox | Market Research & Marketing Agency in Pune";
  const description =
    "Pune research and marketing agency for market research, consumer insight, campaign analytics, SEO and social media for businesses across India.";
  const meta = {
    title,
    description,
    path: "/",
    jsonLd: seo.graph([seo.ORGANIZATION, seo.WEBSITE, seo.pageEntry("WebPage", { path: "/", name: title, description })]),
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

router.get("/services", async (req, res) => {
  const [row, subServiceRows] = await Promise.all([
    prisma.pageContent.findUnique({ where: { page: "services" } }),
    prisma.subService.findMany({ orderBy: { order: "asc" } }),
  ]);
  const content = mergePublishedPage("services", row);
  const subServicesByKey = subServicesByKeyFromRows(subServiceRows);
  const services = SERVICES.map((svc) => ({
    ...svc,
    items: subServicesByKey[svc.id].map((it, i) => ({ ...it, num: String(i + 1).padStart(2, "0") })),
  }));

  const title = "Research & Marketing Services in Pune, India | Kargatox";
  const description =
    "Market research, consumer behaviour analysis, campaign analytics, SEO, social media and brand campaign services from Kargatox, Pune.";
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
            name: "Kargatox Services",
            numberOfItems: SERVICE_PAGES.length,
            itemListElement: SERVICE_PAGES.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: p.navTitle,
                url: `${seo.SITE_URL}/${p.slug}`,
                description: p.metaDescription,
                provider: { "@id": seo.SITE_URL + "/#organization" },
              },
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
  res.render("site/services", { content, services, meta });
});

router.get("/how-we-work", async (req, res) => {
  const row = await prisma.pageContent.findUnique({ where: { page: "how-we-work" } });
  const content = mergePublishedPage("how-we-work", row);

  const title = "How We Work | 5-Step Research & Marketing Process";
  const description =
    "See the Kargatox 5-step process from discovery to handover: we listen, plan, build, fix what is costing you, and hand you the system.";
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
  res.render("site/how-we-work", { content, meta });
});

router.get("/faq", async (req, res) => {
  const [row, faqRows] = await Promise.all([
    prisma.pageContent.findUnique({ where: { page: "faq" } }),
    prisma.faqItem.findMany({ orderBy: { order: "asc" } }),
  ]);
  const content = mergePublishedPage("faq", row);
  const faqItems = faqItemsFromRows(faqRows);
  const [headingPlain, headingAccent] = splitFirstSentence(content.heading);
  const title = "FAQ | Research, SEO & Marketing Questions | Kargatox";
  const description =
    "Straight answers about Kargatox: what we do, how fast we start, pricing, and how our research and marketing engagements work.";
  const meta = {
    title,
    description,
    path: "/faq",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      Object.assign(seo.faqSchema("/faq", faqItems, { nested: false, name: title, description }), {
        breadcrumb: { "@id": seo.SITE_URL + "/faq#breadcrumb" },
      }),
      seo.breadcrumb("/faq", [
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ]),
    ]),
  };
  res.render("site/faq", { content, headingPlain, headingAccent, faqItems, meta });
});

router.get("/contact", async (req, res) => {
  const row = await prisma.pageContent.findUnique({ where: { page: "contact" } });
  const content = mergePublishedPage("contact", row);
  const [headingPlain, headingAccent] = splitLastWord(content.heading);
  const title = "Contact Kargatox | Marketing Agency in Pimple Saudagar";
  const description =
    "Contact Kargatox in Pimple Saudagar, Pune for market research, SEO and marketing. Call +91 78877 89471 or send an inquiry today.";
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

router.get("/clients", (req, res) => {
  const title = "Clients & Case Studies | SEO and ERP Projects | Kargatox";
  const description =
    "Kargatox client work: SEO that ranked 150+ keywords for a Pune market research firm, a manufacturing ERP system and guest posts.";
  const authorId = seo.SITE_URL + "/#jayesh-kamble";
  const pageId = seo.SITE_URL + "/clients";

  const meta = {
    title,
    description,
    path: "/clients",
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("CollectionPage", {
        path: "/clients",
        name: title,
        description,
        extra: {
          breadcrumb: { "@id": pageId + "#breadcrumb" },
          mainEntity: {
            "@type": "ItemList",
            name: "Kargatox clients and case studies",
            numberOfItems: 3,
            itemListElement: [
              { "@type": "ListItem", position: 1, item: { "@id": pageId + "#consegic-business-intelligence" } },
              { "@type": "ListItem", position: 2, item: { "@id": pageId + "#manufacturing-erp-system" } },
              { "@type": "ListItem", position: 3, item: { "@id": pageId + "#global-trade-magazine" } },
            ],
          },
        },
      }),
      seo.breadcrumb("/clients", [
        { name: "Home", path: "/" },
        { name: "Clients", path: "/clients" },
      ]),
      {
        "@type": "CreativeWork",
        "@id": pageId + "#consegic-business-intelligence",
        name: "SEO for " + SEO_CASE_STUDY.client,
        url: pageId + "#consegic-business-intelligence",
        creator: { "@id": seo.SITE_URL + "/#organization" },
        contributor: { "@id": authorId },
        description:
          "Site audits for crawlability, indexing, metadata and broken links; keyword research and on-page optimisation ranking 150+ keywords; off-page link building, outreach and guest posting.",
        about: {
          "@type": "Organization",
          name: SEO_CASE_STUDY.client,
          url: SEO_CASE_STUDY.url,
          description: "Global market research and consulting company",
          address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
        },
        keywords: "technical SEO, on-page SEO, off-page SEO, keyword research, link building, guest posting",
      },
      {
        "@type": "SoftwareApplication",
        "@id": pageId + "#manufacturing-erp-system",
        name: ERP_CASE_STUDY.title,
        url: pageId + "#manufacturing-erp-system",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        creator: { "@id": seo.SITE_URL + "/#organization" },
        description:
          "End-to-end ERP for a metal manufacturing company with " + ERP_CASE_STUDY.modules.join(", ") + " modules.",
        featureList: ERP_CASE_STUDY.modules,
        softwareRequirements: ERP_CASE_STUDY.techStack.join(", "),
      },
      {
        "@type": "CreativeWorkSeries",
        "@id": pageId + "#global-trade-magazine",
        name: "Guest articles on Global Trade Magazine",
        url: pageId + "#global-trade-magazine",
        author: { "@id": authorId },
        hasPart: ARTICLES.map((a) => ({
          "@type": "Article",
          headline: a.title,
          url: a.url,
          datePublished: a.datePublished,
          author: { "@id": authorId },
          publisher: { "@type": "Organization", name: "Global Trade Magazine", url: "https://www.globaltrademag.com/" },
        })),
      },
      {
        "@type": "Person",
        "@id": authorId,
        name: AUTHOR.name,
        jobTitle: AUTHOR.jobTitle,
        worksFor: { "@id": seo.SITE_URL + "/#organization" },
        sameAs: [AUTHOR.profileUrl],
        knowsAbout: ["Technical SEO", "On-page SEO", "Off-page SEO", "Keyword Research", "Guest Posting", "C#", "ASP.NET MVC", "SQL Server"],
      },
    ]),
  };
  res.render("site/clients", { STATS, SEO_CASE_STUDY, ERP_CASE_STUDY, AUTHOR, ARTICLES, meta });
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

router.get("/blog", async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const title = "Blog | Research & Marketing Insights | Kargatox";
  const description =
    "Insights, case studies and updates on market research, SEO and growth marketing from the Kargatox team in Pune.";
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
  res.render("site/blog-list", { posts, meta });
});

router.get("/blog/:slug", async (req, res, next) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || post.status !== "PUBLISHED") return next();

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || title;
  const path = "/blog/" + post.slug;
  const meta = {
    title,
    description,
    path,
    jsonLd: seo.graph([
      seo.ORGANIZATION,
      seo.WEBSITE,
      seo.pageEntry("WebPage", {
        path,
        name: title,
        description,
        extra: { breadcrumb: { "@id": seo.SITE_URL + path + "#breadcrumb" } },
      }),
      seo.breadcrumb(path, [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ]),
    ]),
  };
  res.render("site/blog-post", { post, meta });
});

module.exports = router;
