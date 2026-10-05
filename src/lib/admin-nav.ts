// Only Dashboard and Enquiries are real (build steps 5-6). The rest render a
// "not built yet" placeholder (see src/app/admin/(protected)/*) rather than
// 404ing, so the sidebar nav can show the full README-spec layout now.
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", breadcrumb: "Admin" },
  { href: "/admin/enquiries", label: "Enquiries", breadcrumb: "Admin / Enquiries" },
  { href: "/admin/revenue-checks", label: "Revenue checks", breadcrumb: "Admin / Revenue checks" },
  { href: "/admin/pages", label: "Pages", breadcrumb: "Admin / Pages" },
  { href: "/admin/services-faq", label: "Services & FAQ", breadcrumb: "Admin / Services & FAQ" },
  { href: "/admin/blog", label: "Blog & case studies", breadcrumb: "Admin / Blog & case studies" },
  { href: "/admin/team", label: "Team", breadcrumb: "Admin / Team" },
  { href: "/admin/settings", label: "Settings", breadcrumb: "Admin / Settings" },
] as const;
