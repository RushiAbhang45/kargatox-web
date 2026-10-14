// SQLite can't store native enums, so `User.role` is a plain string (same
// convention as Enquiry.status/source) validated here instead of in the DB.
export const ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"] as const;
export type Role = (typeof ROLES)[number];

// README's Team section: "Sales: enquiries and revenue checks; can reply and
// export" — Editor gets pages/services/FAQ/blog, not enquiries.
const ENQUIRY_ACCESS_ROLES: Role[] = ["OWNER", "ADMIN", "SALES"];

export function canAccessEnquiries(role: Role) {
  return ENQUIRY_ACCESS_ROLES.includes(role);
}

// README's Team section: "Admin: all content, enquiries, settings and team" —
// Editor/Sales don't get Team access.
const TEAM_ACCESS_ROLES: Role[] = ["OWNER", "ADMIN"];

export function canAccessTeam(role: Role) {
  return TEAM_ACCESS_ROLES.includes(role);
}

// README's Team section: "Editor: pages, services, FAQ and blog" — covers
// Pages, Services & FAQ, and Blog & case studies. Sales doesn't get content
// access (it only gets enquiries/revenue checks, per canAccessEnquiries).
const CONTENT_ACCESS_ROLES: Role[] = ["OWNER", "ADMIN", "EDITOR"];

export function canAccessContent(role: Role) {
  return CONTENT_ACCESS_ROLES.includes(role);
}

// README's Team section: "Admin: all content, enquiries, settings and team" —
// Editor/Sales don't get Settings access (same role set as Team, kept as its
// own helper since the two concerns are unrelated and could diverge later).
const SETTINGS_ACCESS_ROLES: Role[] = ["OWNER", "ADMIN"];

export function canAccessSettings(role: Role) {
  return SETTINGS_ACCESS_ROLES.includes(role);
}
