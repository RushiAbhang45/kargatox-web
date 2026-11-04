import { z } from "zod";
import { ROLES } from "@/lib/roles";

// README's Team section: "{n} of 5 seats used" — blocks inviting once every
// seat (every User row, invited or active) is taken.
export const MAX_TEAM_SEATS = 5;

// Also enforced client-side via the create-member form's <input minLength>
// (src/components/admin/team-view.tsx).
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
  role: z.enum(ROLES),
});
