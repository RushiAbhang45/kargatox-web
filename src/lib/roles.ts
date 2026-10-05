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
