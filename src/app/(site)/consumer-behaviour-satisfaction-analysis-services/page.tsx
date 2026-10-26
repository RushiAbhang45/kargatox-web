import type { Metadata } from "next";
import { ServiceLandingPage } from "@/components/services/service-landing-page";
import { getServicePage } from "@/lib/service-pages-data";

const content = getServicePage("consumer-behaviour-satisfaction-analysis-services");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function ConsumerBehaviourSatisfactionAnalysisServicesPage() {
  return <ServiceLandingPage content={content} />;
}
