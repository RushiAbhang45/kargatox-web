// Ported from legacy-nextjs-app/src/app/(site)/services/data.ts. Only the sub-service
// items (title/body/link) come from the DB (Phase 2). Each service's `panel` is the
// non-editable industry-stats card shown beside the sub-services — it replaced the
// legacy "SAMPLE DATA" dashboard mock per the client's 2026-11-02 change list, which
// supplied this copy, the figures and their sources.

const SERVICES = [
  {
    id: "research",
    num: "01",
    title: "Research Services",
    tagline: null,
    intro:
      "Consulting & Research for Businesses: We believe quality insights are the bedrock of any successful strategy. Our Research team dives deep into big data and also conducts extensive field research to drive informed business decisions.",
    panel: {
      tag: "Market Research",
      heading: "Know the Market. Find the Opportunity.",
      body: "Better business decisions start with understanding the market, the competition and the people you're selling to.",
      stats: [
        { value: "₹29K Cr", label: "India's research industry" },
        { value: "10.9%", label: "Annual industry growth" },
        { value: "65%", label: "Reported revenue improvement among highly data-driven companies" },
      ],
      sources: "Sources: MRSI FY2025; S&P Global / AWS 2023. Figures refer to different studies.",
    },
    items: [
      {
        title: "Market Research",
        link: "Learn more",
        body: "We harness the power of analytics to identify market trends and formulate practical action plans for business growth.",
      },
      {
        title: "Consumer Behaviour & Satisfaction Analysis",
        link: "Learn more",
        body: "Our strategic research process decodes consumer behaviours, enabling you to empathise with your prospects and deliver personalized solutions that speak to their needs.",
      },
      {
        title: "Campaign Analytics",
        link: "Learn more",
        body: "If it's not measured, it didn't happen! We provide a custom tech stack to help you understand and optimize key campaign performance metrics on digital as well as mainline platforms.",
      },
    ],
  },
  {
    id: "marketing",
    num: "02",
    title: "Marketing Services",
    tagline: "We move the only number that matters. Yours.",
    intro:
      "Our strategists, designers, content creators, and digital specialists work together to build a strong digital presence for your business from everyday content and social media to high-impact campaigns designed to drive visibility, engagement, and growth.",
    panel: {
      tag: "Marketing",
      heading: "If Your Customers Are Online, Your Brand Should Be Too.",
      body: "Consumers are discovering, comparing and choosing products through digital platforms. Brands that fail to adapt risk being overlooked, no matter how good their products are.",
      stats: [
        { value: "~80%", label: "Indian shoppers discover products through social media" },
        { value: "~50%", label: "Research products on social media before buying" },
        { value: "4 in 5", label: "Consumers comfortable with personalised experiences" },
      ],
      sources: "Sources: Meta/GWI 2025; McKinsey 2025; BCG 2024.",
    },
    items: [
      {
        title: "SEO Services",
        link: "Learn more",
        body: "That Increase Organic Traffic & Qualified Leads Appear where customers are searching. Your customers are searching for products and services every day. If your business doesn't appear in search results, you're losing valuable opportunities. SEO determines how easily your business is found when customers search on Google. It's often the first digital interaction a potential customer has with your brand. Kargatox offers comprehensive Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) services that improve your website's visibility across Google Search, AI-powered search engines, voice assistants, and generative AI platforms.",
      },
      {
        title: "Social Media Marketing",
        link: "Learn more",
        body: "Social media is no longer just about posting content—it is where brands build relationships, earn trust, and influence purchasing decisions. It is often the first place customers check before deciding to trust a business. Consistent engagement here shapes how your brand is perceived across Instagram, LinkedIn, Facebook, YouTube and more. Kargatox helps businesses build engaging social media communities through strategic content, storytelling, creative campaigns, and consistent audience interaction. We create Social Media Engagement Strategies that help businesses grow meaningful communities while increasing brand awareness, customer interaction, and lead generation.",
      },
      {
        title: "Brand Campaigns Strategy",
        link: "Learn more",
        body: "Every successful campaign tells a compelling story. we develop integrated brand campaigns that connect emotionally with audiences while delivering measurable business outcomes. From festive campaigns and product launches to awareness initiatives and employer branding, we combine creativity with marketing intelligence to maximize impact.",
      },
    ],
  },
].map((s) => ({
  ...s,
  items: s.items.map((it, i) => ({ ...it, num: String(i + 1).padStart(2, "0") })),
}));

// Shared "default until a row exists" merge, used by both the admin Services & FAQ editor
// (routes/admin.js) and the public /services page (routes/site.js, Phase 2) — groups
// SubService rows by serviceKey, falling back to each service's hardcoded `items` when no
// rows exist yet for that service.
function subServicesByKeyFromRows(subServiceRows) {
  const byKey = {};
  SERVICES.forEach((svc) => {
    const rows = subServiceRows.filter((r) => r.serviceKey === svc.id);
    byKey[svc.id] =
      rows.length > 0
        ? rows.map((r) => ({ title: r.title, body: r.body, link: r.link || "" }))
        : svc.items.map((it) => ({ title: it.title, body: it.body, link: it.link || "" }));
  });
  return byKey;
}

module.exports = { SERVICES, subServicesByKeyFromRows };
