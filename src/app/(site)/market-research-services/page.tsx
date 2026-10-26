import type { Metadata } from "next";
import { ServiceLandingPage } from "@/components/services/service-landing-page";
import { getServicePage } from "@/lib/service-pages-data";

const content = getServicePage("market-research-services");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function MarketResearchServicesPage() {
  return <ServiceLandingPage content={content} />;
}
