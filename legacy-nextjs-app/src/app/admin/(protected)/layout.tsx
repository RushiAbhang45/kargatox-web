import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToastProvider } from "@/components/admin/toast";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const newEnquiryCount = await prisma.enquiry.count({ where: { status: "NEW" } });

  return (
    <AdminToastProvider>
      <AdminShell newEnquiryCount={newEnquiryCount} user={session.user}>
        {children}
      </AdminShell>
    </AdminToastProvider>
  );
}
