import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessEnquiries } from "@/lib/roles";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry-status";

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !canAccessEnquiries(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status =
    statusParam && ENQUIRY_STATUSES.includes(statusParam as EnquiryStatus)
      ? (statusParam as EnquiryStatus)
      : null;

  const enquiries = await prisma.enquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });

  const header = [
    "Name",
    "Company",
    "Email",
    "Phone",
    "Service",
    "Status",
    "Owner",
    "Date",
    "Source",
    "Message",
  ];
  const rows = enquiries.map((e) => [
    e.name,
    e.company ?? "",
    e.email,
    e.phone ?? "",
    e.service,
    e.status,
    e.owner?.name ?? e.owner?.email ?? "",
    e.createdAt.toISOString(),
    e.source,
    e.details,
  ]);

  const csv = [header, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="enquiries.csv"',
    },
  });
}
