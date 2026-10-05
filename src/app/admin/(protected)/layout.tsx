import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminToastProvider } from "@/components/admin/toast";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const newEnquiryCount = await prisma.enquiry.count({ where: { status: "NEW" } });

  return (
    <AdminToastProvider>
      <div className="flex min-h-screen bg-admin-bg font-body text-admin-text">
        <AdminSidebar newEnquiryCount={newEnquiryCount} user={session.user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 p-[28px]">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
