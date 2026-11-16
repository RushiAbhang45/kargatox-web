// Ported from legacy-nextjs-app/src/lib/nav-links.ts, plus an About Us entry added
// for the /about-us page and a Clients entry added for the /clients page (2026-11-14
// SEO content pass) — neither exists in the legacy app.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/clients", label: "Clients" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

module.exports = { NAV_LINKS };
