// Content for the /clients page, ported from the client's uploaded static build of this
// page (2026-11-14 SEO content pass) — this page has no legacy-nextjs-app equivalent and
// no design-handoff mockup, so this file (and views/site/clients.ejs) is the first time
// this content exists as source rather than prerendered output.
const STATS = [
  {
    value: "150+",
    title: "Keywords ranked",
    body: "On-page optimisation and keyword strategy for a global market research firm.",
  },
  {
    value: "11",
    title: "ERP modules built",
    body: "An end-to-end ERP for a metal manufacturing company, from purchase to HR.",
  },
  {
    value: "7",
    title: "Guest articles published",
    body: "Industry articles on Global Trade Magazine, earning authority backlinks.",
  },
];

const SEO_CASE_STUDY = {
  client: "Consegic Business Intelligence",
  location: "Pune, India",
  url: "https://www.consegicbusinessintelligence.com/",
  urlLabel: "consegicbusinessintelligence.com",
  intro:
    "A Pune-based global market research and consulting company. Role: SEO Executive, covering technical, on-page and off-page SEO.",
  deliverables: [
    {
      title: "Technical site audits",
      body: "Ran on-page and site audit tools to find crawlability, indexing, metadata and broken-link issues across client websites.",
    },
    {
      title: "Keyword research & on-page SEO",
      body: "Built keyword maps and on-page optimisation that ranked 150+ keywords and contributed to high-quality lead generation.",
    },
    {
      title: "Off-page SEO & link building",
      body: "Earned quality backlinks through outreach and off-page activities to grow organic traffic and rankings.",
    },
    {
      title: "Guest posting",
      body: "Placed expert articles on industry publications for stronger authority and better results.",
    },
  ],
  servicesUsed: [
    { label: "SEO Services", href: "/seo-services" },
    { label: "Market Research", href: "/market-research-services" },
  ],
};

const ERP_CASE_STUDY = {
  title: "Manufacturing Industrial ERP System",
  subtitle: "for a metal manufacturer",
  intro:
    "An end-to-end ERP application built for a metal manufacturing company, so every department works from one system and one set of numbers.",
  techStack: ["C#", "ASP.NET MVC", "Web API", "SQL Server 2014/2019", "N-Tier Architecture", "jQuery", "AJAX", "Bootstrap"],
  modules: ["Master", "Purchase", "Manufacturing", "Service", "Maintenance", "Training", "Engineering", "Quality", "Sales", "Finance", "HR"],
  modulesNote:
    "Structured on an N-Tier architecture with a Web API layer and SQL Server, so modules share master data while each team gets the screens and reports it needs.",
};

const AUTHOR = {
  name: "Jayesh Kamble",
  jobTitle: "SEO Executive",
  profileUrl: "https://www.globaltrademag.com/author/jayesh-kamble/",
};

// datePublished is the exact date each article went live — kept so the JSON-LD CreativeWorkSeries
// entry (routes/site.js) can cite them; `date` is the same date formatted for display.
const ARTICLES = [
  {
    title: "Challenges Faced by Low-Cost Carriers (LCCs)",
    url: "https://www.globaltrademag.com/challenges-faced-by-low-cost-carriers-lccs/",
    datePublished: "2024-10-31",
    date: "Oct 2024",
  },
  {
    title: "The Role of AI in Financial Services",
    url: "https://www.globaltrademag.com/the-role-of-ai-in-financial-services/",
    datePublished: "2024-09-25",
    date: "Sep 2024",
  },
  {
    title: "The Impact of Automation and AI on Supply Chain Efficiency",
    url: "https://www.globaltrademag.com/the-impact-of-automation-and-ai-on-supply-chain-efficiency-transforming-logistics-for-the-future/",
    datePublished: "2024-09-09",
    date: "Sep 2024",
  },
  {
    title: "The Integration of Pay Card Readers with Online Banking Platforms",
    url: "https://www.globaltrademag.com/the-integration-of-pay-card-readers-with-online-banking-platforms/",
    datePublished: "2024-08-07",
    date: "Aug 2024",
  },
  {
    title: "Trends in Online Banking: A Technical Perspective",
    url: "https://www.globaltrademag.com/trends-in-online-banking-a-technical-perspective/",
    datePublished: "2024-07-31",
    date: "Jul 2024",
  },
  {
    title: "Crawler Cranes Market to Reach USD 7,026 Million by 2030",
    url: "https://www.globaltrademag.com/crawler-cranes-market-to-reach-usd-7026-million-by-2030/",
    datePublished: "2024-06-10",
    date: "Jun 2024",
  },
  {
    title: "Top Markets and Trending Segments for Truck-Mounted Cranes",
    url: "https://www.globaltrademag.com/top-markets-and-trending-segments-for-truck-mounted-cranes/",
    datePublished: "2024-04-18",
    date: "Apr 2024",
  },
];

// Client logo wall (client change list 2026-11-02) — shown on /clients and as a strip on
// the home page. Drop each logo into public/images/clients/<slug>.{svg,png,webp,jpg};
// until a file exists the card falls back to a monogram tile, so the wall never shows a
// broken image. `work` is the one-line "what we did for them" caption — left null until
// the client supplies it (we don't invent it); cards render without the line meanwhile.
const fs = require("fs");
const path = require("path");

const LOGO_DIR = path.join(__dirname, "..", "public", "images", "clients");
const LOGO_EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"];

function findLogo(slug) {
  for (const ext of LOGO_EXTENSIONS) {
    if (fs.existsSync(path.join(LOGO_DIR, `${slug}.${ext}`))) return `/images/clients/${slug}.${ext}`;
  }
  return null;
}

const CLIENT_LOGOS = [
  { name: "Coffice 24x7", slug: "coffice-24x7", work: null },
  { name: "Purwa Engg Works", slug: "purwa-engg-works", work: null },
  { name: "Camp India", slug: "camp-india", work: null },
  { name: "Shree Manufacturing", slug: "shree-manufacturing", work: null },
  { name: "Little Stars English Medium School", slug: "little-stars-english-medium-school", work: null },
].map((c) => ({
  ...c,
  logo: findLogo(c.slug),
  monogram: c.name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join(""),
}));

module.exports = { STATS, SEO_CASE_STUDY, ERP_CASE_STUDY, AUTHOR, ARTICLES, CLIENT_LOGOS };
