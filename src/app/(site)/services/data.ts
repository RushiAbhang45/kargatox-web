const BAR_HEIGHTS = [34, 42, 38, 51, 47, 58, 55, 66, 62, 74, 81, 92];

export const SERVICES = [
  {
    id: "research",
    num: "01",
    title: "Research Services",
    tagline: null as string | null,
    intro:
      "Consulting & Research for Businesses: We believe quality insights are the bedrock of any successful strategy. Our Research team dives deep into big data and also conducts extensive field research to drive informed business decisions.",
    panelTitle: "Market signals",
    kind: "research" as const,
    bars: BAR_HEIGHTS.map((h, i) => ({ h, orange: i > 8 })),
    kpis: [
      { label: "Market growth", value: "+18%", delta: "↑ vs last year" },
      { label: "Satisfaction", value: "4.3", delta: "↑ 0.4 pts" },
      { label: "Campaign CTR", value: "3.4%", delta: "↑ 1.1%" },
    ],
    items: [
      {
        title: "Market Research",
        link: null as string | null,
        body: "We harness the power of analytics to identify market trends and formulate practical action plans for business growth.",
      },
      {
        title: "Consumer Behaviour & Satisfaction Analysis",
        link: null as string | null,
        body: "Our strategic research process decodes consumer behaviours, enabling you to empathise with your prospects and deliver personalized solutions that speak to their needs.",
      },
      {
        title: "Campaign Analytics",
        link: null as string | null,
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
    panelTitle: "Search & social",
    kind: "marketing" as const,
    keywords: [
      { term: "market research agency india", from: 24, to: 3 },
      { term: "consumer insights firm", from: 31, to: 5 },
      { term: "growth consulting startups", from: 18, to: 2 },
      { term: "brand campaign strategy", from: 40, to: 7 },
    ],
    channels: [
      { name: "Instagram", w: 82, orange: true },
      { name: "LinkedIn", w: 68, orange: false },
      { name: "YouTube", w: 54, orange: false },
    ],
    kpis: [
      { label: "Organic traffic", value: "3.2x", delta: "↑ in 6 months" },
      { label: "Qualified leads", value: "+140%", delta: "↑ from search" },
      { label: "Engagement", value: "6.8%", delta: "↑ 2.3%" },
    ],
    items: [
      {
        title: "SEO Services",
        link: "Click here for detailed section",
        body: "That Increase Organic Traffic & Qualified Leads Appear where customers are searching. Your customers are searching for products and services every day. If your business doesn't appear in search results, you're losing valuable opportunities. SEO determines how easily your business is found when customers search on Google. It's often the first digital interaction a potential customer has with your brand. Kargatox offers comprehensive Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) services that improve your website's visibility across Google Search, AI-powered search engines, voice assistants, and generative AI platforms.",
      },
      {
        title: "Social Media Marketing",
        link: "Click here",
        body: "Social media is no longer just about posting content—it is where brands build relationships, earn trust, and influence purchasing decisions. It is often the first place customers check before deciding to trust a business. Consistent engagement here shapes how your brand is perceived across Instagram, LinkedIn, Facebook, YouTube and more. Kargatox helps businesses build engaging social media communities through strategic content, storytelling, creative campaigns, and consistent audience interaction. We create Social Media Engagement Strategies that help businesses grow meaningful communities while increasing brand awareness, customer interaction, and lead generation.",
      },
      {
        title: "Brand Campaigns Strategy",
        link: "Click here",
        body: "Every successful campaign tells a compelling story. we develop integrated brand campaigns that connect emotionally with audiences while delivering measurable business outcomes. From festive campaigns and product launches to awareness initiatives and employer branding, we combine creativity with marketing intelligence to maximize impact.",
      },
    ],
  },
].map((s) => ({
  ...s,
  items: s.items.map((it, i) => ({ ...it, num: String(i + 1).padStart(2, "0") })),
}));
