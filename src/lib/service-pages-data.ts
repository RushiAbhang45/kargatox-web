// Content for the six standalone service landing pages added under the
// research/marketing sub-services listed on /services (src/app/(site)/services/data.ts).
// Source: client-supplied "Kargatox – SEO Content for 6 Service update" doc — copy, meta
// tags, FAQs and related-service links below are taken from it, not paraphrased, aside
// from two corrections noted inline. Rendered by src/components/services/service-landing-page.tsx;
// one page.tsx per slug under src/app/(site)/ does the metadata export + render.

export type ServiceCoverItem = { title: string; body: string };
export type ServiceStep = { label: string; body: string };
export type ServiceBulletList = { heading: string; items: string[] };
export type ServiceFaq = { question: string; answer: string };

export type ServicePageContent = {
  slug: string;
  navTitle: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  coverHeading: string;
  coverItems: ServiceCoverItem[];
  approachHeading: string;
  approachBody: string;
  steps?: { heading?: string; items: ServiceStep[] };
  bulletLists: ServiceBulletList[];
  faqHeading: string;
  faqs: ServiceFaq[];
  relatedSlugs: string[];
};

export const SERVICE_PAGES: ServicePageContent[] = [
  {
    slug: "market-research-services",
    navTitle: "Market Research",
    eyebrow: "RESEARCH SERVICES",
    metaTitle: "Market Research Services in India | Kargatox",
    metaDescription:
      "Kargatox delivers market research in India: market sizing, competitor analysis, customer surveys and demand forecasting that help founders decide with data.",
    h1: "Market Research Services in India That Turn Data into Decisions",
    intro:
      "Successful business decisions start with a clear understanding of your market. Kargatox is a trusted market research company in India offering professional market research services for businesses of every size. Our market analysis services help you identify market opportunities, while our competitor analysis services and competitor research and market analysis services show you how you compare with others in your space. Through customer insights research and target market analysis, we evaluate customer needs and uncover what your audience truly wants. As a results-driven market research agency, we also provide industry research services and market trends analysis, so you can spot shifts early and act on them. Whether you are entering a new market, launching a product, or need market research for startups in India, our market opportunity analysis and market opportunity research for business growth give you the clarity to move forward. With structured business market research and combined customer and industry research services, Kargatox helps you understand where your business stands and what to do next.",
    coverHeading: "What our market research covers",
    coverItems: [
      {
        title: "Market sizing and opportunity analysis",
        body: "We estimate your total, serviceable and obtainable market (TAM, SAM, SOM) so you know whether the opportunity is worth the investment.",
      },
      {
        title: "Competitor analysis",
        body: "We map your direct and indirect competitors: pricing, positioning, channels, strengths and weak spots. You see where to compete and where to stay away.",
      },
      {
        title: "Customer and segment research",
        body: "Through surveys, interviews and focus groups, we find out who buys, why they buy and what makes them leave.",
      },
      {
        title: "Market entry and expansion research",
        body: "Moving into a new region, segment or product category? We test demand and regulatory, pricing and distribution factors before you commit capital.",
      },
      {
        title: "Industry and trend analysis",
        body: "We track what is changing in your sector so your strategy is built on where the market is going, not where it was.",
      },
    ],
    approachHeading: "Our approach: primary and secondary research combined",
    approachBody:
      "We combine desk research (industry reports, public filings, government data) with fresh primary research (surveys & interviews). The result is insight specific to your business, not a recycled industry report.",
    steps: {
      items: [
        { label: "We listen", body: "We define the decision the research must support." },
        { label: "You get the plan", body: "Scope, method, sample and timeline agreed by day 7." },
        { label: "We build it", body: "Fieldwork, analysis and a findings session where we tell you what to do next." },
      ],
    },
    bulletLists: [
      {
        heading: "Who it is for",
        items: [
          "Founders validating a new product or pricing",
          "Leadership teams planning expansion across Indian cities and states",
          "B2B and D2C brands benchmarking against competitors",
          "Investors and boards who need an independent view before a decision",
        ],
      },
      {
        heading: "What you receive",
        items: [
          "A decision-ready research report, not a 100-page data dump",
          "Market size and growth model",
          "Competitor benchmark",
          "Customer segment profiles",
          "Clear recommendations with priorities",
        ],
      },
    ],
    faqHeading: "Market research FAQs",
    faqs: [
      {
        question: "How long does a market research project take?",
        answer:
          "Most projects take two to six weeks depending on scope and sample size. We confirm the timeline in the plan we deliver on day 7.",
      },
      {
        question: "What is the difference between primary and secondary research?",
        answer:
          "Secondary research uses existing published data. Primary research is new data collected directly from your customers and market through surveys and interviews. We usually combine both.",
      },
      {
        question: "Do you do B2B market research?",
        answer: "Yes. We work with both B2B and consumer brands across India.",
      },
      {
        question: "How much does market research cost?",
        answer:
          "It depends on scope, sample size and geography. Share your goal through the inquiry form and we will scope it against the decision it needs to support.",
      },
    ],
    relatedSlugs: ["consumer-behaviour-satisfaction-analysis-services", "brand-campaign-strategy-services"],
  },
  {
    slug: "consumer-behaviour-satisfaction-analysis-services",
    navTitle: "Consumer Behaviour & Satisfaction Analysis",
    eyebrow: "RESEARCH SERVICES",
    metaTitle: "Consumer Behaviour & Satisfaction Analysis | Kargatox",
    metaDescription:
      "Understand why customers buy, stay or leave. Kargatox runs consumer behaviour research, CSAT and NPS studies and churn analysis for brands across India.",
    h1: "Consumer Behaviour & Customer Satisfaction Analysis",
    intro:
      "Knowing what customers buy is useful. Understanding why they buy, what influences their decisions and what makes them return can be even more valuable. Kargatox offers consumer behaviour analysis services in India that help businesses explore consumer buying behaviour, customer preferences, buying patterns and satisfaction levels. Through consumer behaviour research and consumer behaviour audit, we uncover the motives behind every purchase. Our customer satisfaction analysis, customer satisfaction survey programs and customer satisfaction research for businesses show you how customers truly feel about your brand. With customer feedback analysis and customer feedback and satisfaction analysis, we turn opinions and available behavioural data into customer insights analysis you can act on. Our customer journey analysis and customer segmentation analysis reveal how different groups move through their buying process, while customer experience research and customer experience improvement research highlight where you can do better. The result is a stronger customer retention strategy, better customer experiences and lasting business relationships.",
    coverHeading: "What we analyse",
    coverItems: [
      {
        title: "Buying behaviour and purchase journey",
        body: "We map how customers discover, compare and decide, and where they drop off.",
      },
      {
        title: "Customer satisfaction (CSAT) and Net Promoter Score (NPS)",
        body: "We design and run satisfaction studies that go beyond a score and explain what is driving it.",
      },
      {
        title: "Churn and retention drivers",
        body: "We identify why customers leave and which segments are most at risk, so retention work is aimed at the right people.",
      },
      {
        title: "Buyer personas and segmentation",
        body: "We build segments from real behaviour and research, not assumptions, so your messaging and offers fit each group.",
      },
      {
        title: "Voice of customer",
        body: "We analyse reviews, support tickets, call recordings and survey responses to surface the themes that matter.",
      },
    ],
    approachHeading: "How it works",
    approachBody:
      "We sit inside your CRM, your support data and your customer conversations. We combine that behavioural data with surveys and interviews so you get both the what and the why.",
    steps: {
      items: [
        { label: "We listen", body: "Audit of your existing customer data and feedback channels." },
        { label: "You get the plan", body: "Research design and the metrics we will move, agreed by day 7." },
        { label: "We build it", body: "Analysis, insights and a prioritised action plan your team can run." },
      ],
    },
    bulletLists: [
      {
        heading: "Why it matters for revenue",
        items: [
          "Retaining a customer usually costs less than acquiring a new one",
          "Understanding satisfaction drivers lets you reduce churn, lift repeat purchase and improve referrals, which directly moves revenue",
        ],
      },
      {
        heading: "What you receive",
        items: [
          "Customer journey map with drop-off points",
          "Satisfaction and NPS findings with root-cause drivers",
          "Churn risk segments",
          "Buyer personas",
          "A ranked list of fixes by impact",
        ],
      },
    ],
    faqHeading: "FAQs",
    faqs: [
      {
        question: "What is the difference between CSAT and NPS?",
        answer:
          "CSAT measures satisfaction with a specific interaction or purchase. NPS measures how likely customers are to recommend you, which signals overall loyalty. We often use both.",
      },
      {
        question: "How many customers do we need to survey?",
        answer: "It depends on your base and the segments you want to compare. We recommend a sample size in the plan stage.",
      },
      {
        question: "Can you work with our existing CRM data?",
        answer: "Yes. We work inside your CRM and analytics tools wherever possible.",
      },
    ],
    relatedSlugs: ["market-research-services", "campaign-analytics-services"],
  },
  {
    slug: "campaign-analytics-services",
    navTitle: "Campaign Analytics",
    eyebrow: "RESEARCH SERVICES",
    metaTitle: "Campaign Analytics & Performance Reporting | Kargatox",
    metaDescription:
      "Know which campaigns drive revenue. Kargatox offers campaign analytics, attribution, ROI tracking and dashboards so you stop wasting marketing budget.",
    h1: "Campaign Analytics: See What Actually Drives Revenue",
    intro:
      // Source doc's intro has a broken fragment ("We by approach, backed by...") —
      // corrected to "Our approach, backed by..." below; every other word is verbatim.
      "Marketing activity generates data, but data alone does not explain what is working or where improvements are needed. Kargatox offers campaign analytics services that help businesses evaluate campaign performance analysis, understand audience engagement and assess how marketing activities contribute to business objectives. Our approach, backed by digital marketing campaign analytics services, connects relevant metrics with practical recommendations. Through marketing ROI analysis, return on ad spend analysis and campaign ROI tracking and reporting, we show you where your budget delivers results. Our conversion tracking services and campaign conversion and lead performance analysis reveal how campaigns turn audiences into leads and customers. With campaign reporting services, marketing performance measurement and marketing campaign performance measurement, your team gets clear, regular visibility into progress. Whether we are handling advertising campaign analysis, campaign data analysis or data-driven marketing campaign analysis, the goal is the same: to help your team make more informed marketing decisions.",
    coverHeading: "What we do",
    coverItems: [
      {
        title: "Tracking and measurement setup",
        body: "We configure Google Analytics 4, Google Tag Manager, conversion events, UTM standards and CRM integration so every lead is traceable to its source.",
      },
      {
        title: "Attribution analysis",
        body: "We show which channels start, assist and close sales, so credit is not handed to the last click alone.",
      },
      {
        title: "Campaign performance and ROI",
        body: "We measure cost per lead, customer acquisition cost (CAC), return on ad spend (ROAS) and payback period for every campaign.",
      },
      {
        title: "Funnel analysis",
        body: "We find where leads stall between enquiry, qualification and sale, and what to change.",
      },
      {
        title: "Dashboards and reporting",
        body: "Live dashboards your leadership team can read in minutes, with the numbers tied to revenue, not vanity metrics.",
      },
    ],
    approachHeading: "Numbers first",
    approachBody:
      "Every engagement is scoped against a number that needs to move: pipeline, retention or revenue. Reports are built around that number, with a clear recommendation each month.",
    bulletLists: [
      {
        heading: "Who it is for",
        items: [
          "Brands running paid ads, SEO and social without a single view of results",
          "Teams whose sales and marketing numbers do not match",
          "Leaders who want to cut waste and scale what works",
        ],
      },
      {
        heading: "What you receive",
        items: [
          "Clean tracking across website, ads and CRM",
          "A marketing dashboard",
          "Channel-level ROI and CAC",
          "Monthly insights and budget recommendations",
        ],
      },
    ],
    faqHeading: "FAQs",
    faqs: [
      {
        question: "What is campaign analytics?",
        answer: "It is the measurement and analysis of marketing campaigns to understand what drives leads, sales and return on spend.",
      },
      {
        question: "Which tools do you use?",
        answer: "Typically Google Analytics 4, Google Tag Manager, Looker Studio and your CRM. We work with the stack you already have.",
      },
      {
        question: "Can you audit our current tracking?",
        answer: "Yes. A tracking audit is a common starting point and often finds broken conversions and missing data.",
      },
    ],
    relatedSlugs: ["seo-services", "social-media-marketing-services", "brand-campaign-strategy-services"],
  },
  {
    slug: "seo-services",
    navTitle: "SEO Services",
    eyebrow: "MARKETING SERVICES",
    metaTitle: "SEO Services in India for Revenue Growth | Kargatox",
    metaDescription:
      "Rank higher and get qualified leads. Kargatox provides SEO services in India: technical SEO, keyword strategy, content and link building tied to revenue.",
    h1: "SEO Services in India Built for Rankings",
    intro:
      "Your potential customers are searching online for solutions, products and services. Search engine optimisation (SEO) helps your website become easier for search engines to understand and more useful for people looking for what your business offers. Kargatox is an SEO agency in India providing professional SEO services for businesses in India, from search engine optimization services to website SEO optimization. We help businesses strengthen their organic search presence through SEO keyword research, on-page SEO services and on-page SEO and keyword research services that match your content to what people actually search for. Our technical SEO services, website SEO audit and technical SEO audit and optimization services find and fix the issues that hold your site back, while our SEO content strategy builds relevance and authority over time. Whether you need local SEO services to reach nearby customers or an SEO strategy for small businesses, our focus is on organic traffic growth and search engine ranking optimization. With clear SEO performance reporting and organic search traffic improvement services, we help you attract relevant visitors and build a stronger foundation for sustainable organic growth.",
    coverHeading: "Our SEO services",
    coverItems: [
      { title: "SEO audit", body: "A full review of technical health, content, backlinks and competitors, with a prioritised fix list." },
      {
        title: "Keyword research and strategy",
        body: "We find the high-intent terms your customers use and map them to pages, so every page has a clear job.",
      },
      {
        title: "Technical SEO",
        body: "Site speed, Core Web Vitals, crawlability, indexing, structured data, mobile usability and site architecture.",
      },
      {
        title: "On-page SEO",
        body: "Titles, meta descriptions, headings, internal links and content optimisation for each target page.",
      },
      {
        title: "Content SEO",
        body: "Blogs, guides and landing pages that answer buyer questions and build topical authority.",
      },
      {
        title: "Link building and digital PR",
        body: "Relevant, quality backlinks that strengthen domain authority without risky shortcuts.",
      },
      {
        title: "Local SEO",
        body: "Google Business Profile optimisation and city-level pages for businesses serving specific Indian markets.",
      },
    ],
    approachHeading: "Why research-led SEO works",
    approachBody:
      "Because Kargatox is also a research firm, your SEO is built on real customer language and competitor gaps, not guesswork. We use market and customer insight to decide which keywords to chase and what content will convert.",
    steps: {
      heading: "How we work",
      items: [
        { label: "We listen", body: "Audit, goals and competitor review." },
        { label: "You get the plan", body: "Keyword map and roadmap." },
        { label: "We build it", body: "Fixes, content and links, with monthly reporting on rankings, leads and revenue." },
      ],
    },
    bulletLists: [
      {
        heading: "What you receive",
        items: [
          "Technical audit and fix list",
          "Keyword and content map",
          "Optimised pages and new content",
          "Monthly report tied to leads and revenue",
        ],
      },
    ],
    faqHeading: "FAQs",
    faqs: [
      {
        question: "How long does SEO take to show results?",
        answer:
          "Most sites see early movement within three to four months, with stronger results at six to twelve months. It depends on competition and starting point.",
      },
      {
        question: "Do you guarantee first-page rankings?",
        answer: "No honest SEO agency can. We commit to a clear plan, transparent reporting and growth in qualified traffic and leads.",
      },
      {
        question: "Do you do ecommerce and B2B SEO?",
        answer: "Yes, with different strategies for product pages, category pages and long B2B sales cycles.",
      },
    ],
    relatedSlugs: ["campaign-analytics-services", "social-media-marketing-services", "market-research-services"],
  },
  {
    slug: "brand-campaign-strategy-services",
    navTitle: "Brand Campaigns Strategy",
    eyebrow: "MARKETING SERVICES",
    metaTitle: "Brand Campaign Strategy & Positioning | Kargatox",
    metaDescription:
      "Build a brand customers remember. Kargatox designs brand campaign strategy, positioning and messaging backed by research, with results you can measure.",
    h1: "Brand Campaign Strategy That Is Built on Research and Measured in Growth",
    intro:
      "A strong brand campaign does more than communicate a message. It helps the right audience understand what your business stands for, why your offering matters and what makes your brand relevant to their needs. Kargatox offers brand campaign strategy services in India, helping businesses develop a structured brand campaign strategy based on market understanding, audience insights and clear marketing objectives. Brand marketing strategy and brand development strategy work starts with brand positioning services and brand positioning and marketing strategy, so your business stands out for the right reasons. We shape your brand messaging strategy and brand communication strategy, including strategic brand communication for businesses, to ensure every message is clear and consistent. From campaign planning services and brand awareness campaign planning services to brand awareness campaigns and brand promotion strategy, we plan the channels and activities that reach your audience. Through integrated marketing campaigns and integrated brand marketing campaign strategy, supported by a clear marketing campaign strategy and performance measurement, we help bring all the elements of a campaign together.",
    coverHeading: "What we deliver",
    coverItems: [
      {
        title: "Brand positioning",
        body: "We define where you stand in the market and why customers should pick you over alternatives.",
      },
      {
        title: "Messaging framework",
        body: "Clear value propositions, proof points and tone of voice for each audience segment.",
      },
      {
        title: "Integrated campaign planning",
        body: "A channel plan across search, social, email, PR and offline, with budgets, timelines and targets.",
      },
      {
        title: "Launch and go-to-market strategy",
        body: "For new products, markets or rebrands, we plan the sequence, channels and metrics for launch.",
      },
      {
        title: "Measurement framework",
        body: "Awareness, consideration and conversion metrics defined up front, so the campaign is judged on results.",
      },
    ],
    approachHeading: "Research behind every campaign",
    approachBody:
      "We start with market research and customer insight, then build the strategy. Campaigns are tested against real audience feedback before major spend, which reduces risk.",
    steps: {
      heading: "How we work",
      items: [
        { label: "We listen", body: "Brand audit, goals and audience." },
        { label: "You get the plan", body: "Positioning, messaging and campaign roadmap by day 7." },
        { label: "We build it", body: "We work with your team to launch, track and improve." },
      ],
    },
    bulletLists: [
      {
        heading: "Who it is for",
        items: [
          "Founders launching or repositioning a brand",
          "Leadership teams entering new markets across India",
          "Businesses whose marketing feels scattered and inconsistent",
        ],
      },
      {
        heading: "What you receive",
        items: [
          "Brand positioning and messaging document",
          "Campaign strategy and channel plan",
          "Content and creative briefs",
          "KPI and reporting framework",
        ],
      },
    ],
    faqHeading: "FAQs",
    faqs: [
      {
        question: "What is a brand campaign strategy?",
        answer:
          "It is the plan that defines your audience, message, channels and success metrics for a campaign, so all activity points toward one goal.",
      },
      {
        question: "Do you also produce the creative?",
        answer: "We lead strategy and work with your team or creative partners on execution. Ask us about your specific needs.",
      },
      {
        question: "How do you measure brand campaigns?",
        answer: "Through reach, search demand, engagement, leads and revenue, depending on the campaign goal.",
      },
    ],
    relatedSlugs: ["market-research-services", "social-media-marketing-services", "campaign-analytics-services"],
  },
  {
    slug: "social-media-marketing-services",
    navTitle: "Social Media Marketing",
    eyebrow: "MARKETING SERVICES",
    metaTitle: "Social Media Marketing Services in India | Kargatox",
    metaDescription:
      "Grow with social media marketing in India: strategy, content, paid social and community management on LinkedIn, Instagram and more, tied to leads.",
    h1: "Social Media Marketing Services in India That Drive Leads, Not Just Likes",
    intro:
      "Social media gives businesses an opportunity to connect with customers, communicate their value and build lasting audience relationships. To make that opportunity count, brands need a clear strategy, relevant content and a way to measure results. Kargatox is a social media marketing agency offering social media marketing services in India and social media marketing services for businesses of every size. We help you plan a social media strategy and social media marketing strategy in India around your target audience, brand objectives and wider marketing goals. Social media management services cover social media campaign planning and social media campaign management services, along with social media advertising services that put your brand in front of the right people. With a focused social media content strategy and social media content planning for brands, we keep your communication consistent and relevant. Our audience engagement strategy builds real interaction, supporting social media brand awareness and social media lead generation. Backed by social media analytics that turn results into clear insights, we deliver social media marketing for business growth and help you make better decisions.",
    coverHeading: "What we offer",
    coverItems: [
      {
        title: "Social media strategy",
        body: "We choose the platforms, content themes and posting rhythm that fit your audience and goals.",
      },
      {
        title: "Content creation",
        body: "Posts, carousels, short video, thought leadership and campaign content in your brand voice.",
      },
      {
        title: "Paid social advertising",
        body: "Targeted campaigns on Meta (Instagram and Facebook), LinkedIn and YouTube, with budgets tied to CAC and ROAS.",
      },
      {
        title: "LinkedIn marketing for B2B",
        body: "Company page and founder-led content that builds trust with decision makers.",
      },
      {
        title: "Community management",
        body: "Replies, engagement and reputation monitoring so your brand stays responsive.",
      },
      {
        title: "Influencer and partnership marketing",
        body: "Creator collaborations selected by audience fit and measurable results.",
      },
    ],
    approachHeading: "Research-led, data-measured",
    approachBody:
      "We use audience research and analytics to decide what to post and where to spend. Every channel is tracked back to leads and sales, so you know which content earns its place.",
    steps: {
      heading: "How we work",
      items: [
        { label: "We listen", body: "Audience, competitor and channel audit." },
        { label: "You get the plan", body: "Strategy and content calendar by day 7." },
        { label: "We build it", body: "Content, ads and reporting, improved month by month." },
      ],
    },
    bulletLists: [
      {
        heading: "What you receive",
        items: [
          "Platform strategy and content calendar",
          "Created and scheduled content",
          "Paid campaign setup and optimisation",
          "Monthly performance report tied to leads",
        ],
      },
    ],
    faqHeading: "FAQs",
    faqs: [
      {
        question: "Which social platforms should my business use?",
        answer:
          "It depends on your audience. B2B brands usually lead with LinkedIn, consumer brands with Instagram and YouTube. We confirm this in the strategy stage.",
      },
      {
        question: "Do you manage paid ads as well as organic posts?",
        answer: "Yes, we run both and measure them together.",
      },
      {
        question: "How do you report results?",
        answer: "Monthly reports covering reach, engagement, leads and cost per lead, with recommendations.",
      },
    ],
    relatedSlugs: ["brand-campaign-strategy-services", "seo-services", "campaign-analytics-services"],
  },
];

export function getServicePage(slug: string): ServicePageContent {
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown service page slug: ${slug}`);
  return page;
}

export function getRelatedServicePages(content: ServicePageContent): { slug: string; title: string }[] {
  return content.relatedSlugs.map((slug) => {
    const page = getServicePage(slug);
    return { slug: page.slug, title: page.navTitle };
  });
}

// Shared by the /services hub (data.ts) to point each sub-service card's "Learn more"
// link at its real page, and by the site footer's "Services" column — keyed by the
// exact SubService titles in src/app/(site)/services/data.ts.
export const SUB_SERVICE_HREFS: Record<string, string> = Object.fromEntries(
  SERVICE_PAGES.map((p) => [p.navTitle, `/${p.slug}`])
);

// Grouped by eyebrow for the SiteHeader "Services" nav dropdown — same
// research/marketing split the pages themselves use.
export const SERVICE_PAGE_GROUPS: { heading: string; pages: ServicePageContent[] }[] = [
  { heading: "Research Services", pages: SERVICE_PAGES.filter((p) => p.eyebrow === "RESEARCH SERVICES") },
  { heading: "Marketing Services", pages: SERVICE_PAGES.filter((p) => p.eyebrow === "MARKETING SERVICES") },
];
