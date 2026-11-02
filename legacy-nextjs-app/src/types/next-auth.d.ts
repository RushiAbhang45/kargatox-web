import type { Role } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    // Overrides (not extends) the default shape — email is always present
    // here: AdapterUser.email is non-nullable, and the signIn callback in
    // src/auth.ts rejects sign-in for users without an existing DB row.
    user: {
      id: string;
      role: Role;
      name: string | null;
      email: string;
      image: string | null;
    };
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
  }
}
