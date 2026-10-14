import { z } from "zod";

// README's Team section: "{n} of 5 seats used" — blocks inviting once every
// seat (every User row, invited or active) is taken.
export const MAX_TEAM_SEATS = 5;

// OWNER is excluded — it's the single seeded/billing-holder role (see
// prisma/schema.prisma's User model), not something invited through this form.
export const INVITE_ROLE_OPTIONS = ["ADMIN", "EDITOR", "SALES"] as const;
export type InviteRole = (typeof INVITE_ROLE_OPTIONS)[number];

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  email: z.string().trim().email("Please enter a valid email"),
  role: z.enum(INVITE_ROLE_OPTIONS),
});
