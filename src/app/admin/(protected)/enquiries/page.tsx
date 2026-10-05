import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessEnquiries } from "@/lib/roles";
import { EnquiriesView } from "@/components/admin/enquiries-view";

export const metadata: Metadata = { title: "Enquiries — Kargatox Admin" };

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  // README's Team role table: Editor gets pages/services/FAQ/blog, not
  // enquiries. Enforced here (server), not just by hiding the sidebar link.
  if (!canAccessEnquiries(session.user.role)) {
    return (
      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
        <p className="text-[15px] text-admin-muted">
          Your role ({session.user.role}) doesn&apos;t have access to Enquiries.
        </p>
      </div>
    );
  }

  const { id } = await searchParams;

  const [enquiries, users] = await Promise.all([
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { name: true, email: true } } },
        },
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <EnquiriesView
      initialSelectedId={id ?? null}
      currentUserId={session.user.id}
      users={users}
      enquiries={enquiries.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        company: e.company,
        service: e.service,
        details: e.details,
        status: e.status,
        source: e.source,
        ownerId: e.ownerId,
        ownerName: e.owner?.name ?? e.owner?.email ?? null,
        createdAt: e.createdAt.toISOString(),
        messages: e.messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderName: m.sender?.name ?? m.sender?.email ?? "Admin",
        })),
      }))}
    />
  );
}
