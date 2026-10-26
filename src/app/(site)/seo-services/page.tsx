import type { Metadata } from "next";
import { ServiceLandingPage } from "@/components/services/service-landing-page";
import { getServicePage } from "@/lib/service-pages-data";

const content = getServicePage("seo-services");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function SeoServicesPage() {
  return <ServiceLandingPage content={content} />;
}
