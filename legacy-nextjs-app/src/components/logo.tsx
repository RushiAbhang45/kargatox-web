import Image from "next/image";
import Link from "next/link";

// variant="dark" (default) is the original white-on-navy mark — every
// existing call site (admin login/sidebar) keeps working unchanged.
// variant="light" is for the redesign branch's white-background
// header (src/components/site-header.tsx): Tailwind's generated CSS order
// doesn't guarantee a className passed in after "text-white" wins the
// cascade, so the text colour has to be a real variant, not an appended class.
// "light" renders the real logo file (public/images/kargatox-logo.jpg) — it has
// a baked-in white background with no transparency, so it only reads correctly
// on a white/light surface. "dark" has no transparent/dark-background version
// of that asset, so it keeps the CSS-drawn wordmark for navy surfaces.
export function Logo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-ink" : "text-white";

  if (variant === "light") {
    return (
      <Link href="/" className={`flex items-center ${className ?? ""}`}>
        <Image src="/images/kargatox-logo.jpg" alt="Kargatox — Knowledge Partners" width={1584} height={1224} className="h-16 w-auto" priority />
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${textColor} ${className ?? ""}`}>
      <span className="relative block h-[30px] w-[30px]">
        <span className="absolute left-0 top-0 h-5 w-5 rounded-[5px] bg-orange-500" />
        <span className="absolute bottom-0 right-0 h-5 w-5 rounded-[5px] bg-blue-500 mix-blend-screen" />
      </span>
      <span className={`font-display text-[22px] font-bold tracking-[-0.02em] ${textColor}`}>
        Karga<span className="text-orange-400">tox</span>
      </span>
    </Link>
  );
}
