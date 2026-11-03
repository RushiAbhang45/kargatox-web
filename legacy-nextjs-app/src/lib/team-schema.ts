import { z } from "zod";

// README's Team section: "{n} of 5 seats used" — blocks inviting once every
// seat (every User row, invited or active) is taken.
export const MAX_TEAM_SEATS = 5;

// OWNER is excluded — it's the single seeded/billing-holder role (see
// prisma/schema.prisma's User model), not something invited through this form.
export const INVITE_ROLE_OPTIONS = ["ADMIN", "EDITOR", "SALES"] as const;
export type InviteRole = (typeof INVITE_ROLE_OPTIONS)[number];

// Matches the accept-invite flow's own minimum (src/app/admin/accept-invite/actions.ts).
export const MIN_INVITE_PASSWORD_LENGTH = 8;

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  // Lowercased here so every stored email is normalized — the User.email
  // column is a plain Postgres `text` unique index (case-sensitive), and
  // signInWithPassword() (src/app/admin/login/actions.ts) also lowercases
  // its lookup, so creation and login have to agree on casing or a
  // correctly-typed password still fails to match the row.
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(MIN_INVITE_PASSWORD_LENGTH, "Password must be at least 8 characters"),
  role: z.enum(INVITE_ROLE_OPTIONS),
});
