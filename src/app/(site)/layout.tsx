import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/settings";

// GA lives here (the public route group's layout), not the root layout —
// the admin panel must never pick up site analytics tracking.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const ga = settings.gaEnabled ? settings.gaMeasurementId : null;

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}');`}
          </Script>
        </>
      )}
      <SiteHeader />
      {children}
    </>
  );
}
