import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Revenue checks — Kargatox Admin" };

const AREA_KEYS = ["leads", "sales", "retention"] as const;
type AreaKey = (typeof AREA_KEYS)[number];
const AREA_LABEL: Record<AreaKey, string> = { leads: "Leads", sales: "Sales", retention: "Retention" };

// README: "0 = 25% width orange #ff8a3d, 1 = 60% blue #6f9bff, 2 = 100% green
// #1f9d63" — closest existing design tokens (globals.css) to those hexes.
const SCORE_COLOR_CLASS = ["bg-orange-400", "bg-blue-300", "bg-status-won"];
const SCORE_WIDTH = ["25%", "60%", "100%"];

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-2 w-16 overflow-hidden rounded-full bg-admin-soft">
      <div className={`h-full rounded-full ${SCORE_COLOR_CLASS[score]}`} style={{ width: SCORE_WIDTH[score] }} />
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminRevenueChecksPage() {
  const checks = await prisma.revenueCheck.findMany({
    orderBy: { createdAt: "desc" },
    include: { enquiries: { select: { id: true } } },
  });

  const total = checks.length;
  const weakestCounts: Record<AreaKey, number> = { leads: 0, sales: 0, retention: 0 };
  for (const c of checks) {
    if (c.weakest in weakestCounts) weakestCounts[c.weakest as AreaKey] += 1;
  }
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <div className="grid gap-[22px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[22px]">
        <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-admin-muted">CHECKS COMPLETED</p>
          <p className="mt-2 font-display text-[32px] font-semibold text-admin-text">{total}</p>
        </div>
        {AREA_KEYS.map((key) => (
          <div key={key} className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
            <p className="font-mono text-[11px] tracking-[0.1em] text-admin-muted">
              {AREA_LABEL[key].toUpperCase()} WEAKEST
            </p>
            <p className="mt-2 font-display text-[32px] font-semibold text-admin-text">
              {pct(weakestCounts[key])}%
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-admin-border bg-admin-panel">
        <table className="w-full min-w-[800px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-admin-border text-[11px] font-mono tracking-[0.08em] text-admin-muted">
              <th className="px-5 py-3 font-medium">Visitor</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Leads</th>
              <th className="px-5 py-3 font-medium">Sales</th>
              <th className="px-5 py-3 font-medium">Retention</th>
              <th className="px-5 py-3 font-medium">Weakest</th>
              <th className="px-5 py-3 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id} className="border-b border-admin-border last:border-0">
                <td className="px-5 py-3.5 text-admin-text">
                  {c.email ?? (c.city ? `visitor · ${c.city}` : "Anonymous visitor")}
                </td>
                <td className="px-5 py-3.5 text-admin-muted">{formatDate(c.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <ScoreBar score={c.leads} />
                </td>
                <td className="px-5 py-3.5">
                  <ScoreBar score={c.sales} />
                </td>
                <td className="px-5 py-3.5">
                  <ScoreBar score={c.retention} />
                </td>
                <td className="px-5 py-3.5 text-admin-text">{AREA_LABEL[c.weakest as AreaKey] ?? c.weakest}</td>
                <td className="px-5 py-3.5">
                  {c.enquiries.length > 0 ? (
                    <span className="inline-flex items-center whitespace-nowrap rounded-pill bg-status-won px-2.5 py-1 text-[11px] font-semibold text-white">
                      Sent enquiry
                    </span>
                  ) : (
                    <span className="text-[13px] text-admin-muted">No enquiry</span>
                  )}
                </td>
              </tr>
            ))}
            {checks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-admin-muted">
                  No revenue checks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
