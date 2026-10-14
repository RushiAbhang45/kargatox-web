import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTeam } from "@/lib/roles";
import { TeamView } from "@/components/admin/team-view";

export const metadata: Metadata = { title: "Team — Kargatox Admin" };

export default async function AdminTeamPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  // README's Team role table: only Owner/Admin get Team access. Enforced
  // here (server), not just by hiding the sidebar link — same pattern as
  // the Enquiries page's canAccessEnquiries check.
  if (!canAccessTeam(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Team.
        </p>
      </div>
    );
  }

  const members = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      lastActiveAt: true,
      invitedAt: true,
      acceptedAt: true,
    },
  });

  return (
    <TeamView
      currentUserId={session.user.id}
      members={members.map((m) => ({
        ...m,
        lastActiveAt: m.lastActiveAt?.toISOString() ?? null,
        invitedAt: m.invitedAt?.toISOString() ?? null,
        acceptedAt: m.acceptedAt?.toISOString() ?? null,
      }))}
    />
  );
}
