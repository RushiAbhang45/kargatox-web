import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusPill } from "@/components/admin/status-pill";

export const metadata: Metadata = { title: "Dashboard — Kargatox Admin" };

const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

// GA-backed widgets from the README's Dashboard spec (Traffic sources, Site
// visitors, Top pages) are deferred to build step 9 (analytics) rather than
// faked here — everything below is a real query against the Enquiry table.
function weeklyBuckets(createdAts: Date[]) {
  const now = Date.now();
  const buckets = Array(WEEKS).fill(0);
  for (const createdAt of createdAts) {
    const daysAgo = Math.floor((now - createdAt.getTime()) / DAY_MS);
    const weekIndex = WEEKS - 1 - Math.floor(daysAgo / 7);
    if (weekIndex >= 0 && weekIndex < WEEKS) buckets[weekIndex] += 1;
  }
  return buckets;
}

function dateWindows() {
  const now = Date.now();
  return {
    since30d: new Date(now - 30 * DAY_MS),
    since12w: new Date(now - WEEKS * 7 * DAY_MS),
  };
}

export default async function AdminDashboardPage() {
  const { since30d, since12w } = dateWindows();

  const [total, last30d, recentForChart, latest] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: since30d } } }),
    prisma.enquiry.findMany({
      where: { createdAt: { gte: since12w } },
      select: { createdAt: true },
    }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, service: true, status: true },
    }),
  ]);

  const buckets = weeklyBuckets(recentForChart.map((e) => e.createdAt));
  const max = Math.max(1, ...buckets);

  return (
    <div className="grid gap-[22px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[22px]">
        <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-admin-muted">ENQUIRIES (30 DAYS)</p>
          <p className="mt-2 font-display text-[32px] font-semibold text-admin-text">{last30d}</p>
        </div>
        <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-admin-muted">TOTAL ENQUIRIES</p>
          <p className="mt-2 font-display text-[32px] font-semibold text-admin-text">{total}</p>
        </div>
      </div>

      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
        <p className="mb-5 text-[15px] font-semibold text-admin-text">Enquiries per week</p>
        <div className="flex h-[140px] items-end gap-2">
          {buckets.map((count, i) => (
            <div
              key={i}
              title={`${count} enquiries`}
              className={`min-h-[3px] flex-1 rounded-t-[4px] ${
                i >= buckets.length - 2 ? "bg-orange-500" : "bg-blue-300"
              }`}
              style={{ height: `${Math.max(3, (count / max) * 100)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
        <p className="mb-3 text-[15px] font-semibold text-admin-text">Latest enquiries</p>
        {latest.length === 0 ? (
          <p className="py-4 text-[13px] text-admin-muted">No enquiries yet.</p>
        ) : (
          <div className="grid gap-1">
            {latest.map((e) => (
              <Link
                key={e.id}
                href={`/admin/enquiries?id=${e.id}`}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-admin-soft"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-admin-text">{e.name}</p>
                  <p className="truncate text-[12px] text-admin-muted">{e.service}</p>
                </div>
                <StatusPill status={e.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
