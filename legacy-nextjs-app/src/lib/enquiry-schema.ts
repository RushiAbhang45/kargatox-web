import { z } from "zod";

export const SERVICE_OPTIONS = [
  "General Inquiry",
  "Market Research",
  "Consumer Behaviour & Satisfaction Analysis",
  "Campaign Analytics",
  "SEO Services",
  "Social Media Marketing",
  "Brand Campaigns Strategy",
] as const;

export const ENQUIRY_SOURCES = ["Contact form", "Revenue check"] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().optional(),
  service: z.enum(SERVICE_OPTIONS),
  details: z.string().trim().min(1, "Please tell us a little about your requirements"),
  source: z.enum(ENQUIRY_SOURCES),
  // Set when the Contact form is reached via the revenue-check CTA
  // (src/components/home/revenue-check.tsx) — links back to that RevenueCheck
  // row. Looked up, not trusted blindly: see src/app/api/enquiries/route.ts.
  revenueCheckId: z.string().trim().optional(),
});
