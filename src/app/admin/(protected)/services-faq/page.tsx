import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessContent } from "@/lib/roles";
import { SERVICES } from "@/app/(site)/services/data";
import { getSubServiceItems, getFaqItemsOrDefault } from "@/lib/services-content";
import { ServicesFaqView } from "@/components/admin/services-faq-view";

export const metadata: Metadata = { title: "Services & FAQ — Kargatox Admin" };

export default async function AdminServicesFaqPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  if (!canAccessContent(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Services & FAQ.
        </p>
      </div>
    );
  }

  const [subServicesByKey, faqItems] = await Promise.all([
    Promise.all(
      SERVICES.map(async (svc) => [
        svc.id,
        await getSubServiceItems(
          svc.id,
          svc.items.map((it) => ({ title: it.title, body: it.body, link: it.link }))
        ),
      ] as const)
    ),
    getFaqItemsOrDefault(),
  ]);

  return (
    <ServicesFaqView
      services={SERVICES.map((svc) => ({ id: svc.id, title: svc.title }))}
      subServicesByKey={Object.fromEntries(subServicesByKey)}
      faqItems={faqItems.map((f) => ({ question: f.question, answer: f.answer }))}
    />
  );
}
