import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Team — Kargatox Admin" };

export default function AdminTeamPage() {
  return (
    <ComingSoon
      title="Team"
      note="Not built yet — there's no invite flow. Right now the only way to grant admin access is seeding/editing the User table directly (npm run db:seed). That's build step 8."
    />
  );
}
