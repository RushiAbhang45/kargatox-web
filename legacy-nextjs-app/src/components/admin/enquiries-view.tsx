"use client";

import { useMemo, useState, useTransition } from "react";
import { StatusPill } from "@/components/admin/status-pill";
import { useAdminToast } from "@/components/admin/toast";
import { ENQUIRY_STATUSES, STATUS_LABEL, STATUS_COLOR_CLASS, type EnquiryStatus } from "@/lib/enquiry-status";
import { updateEnquiryStatus, assignEnquiry, sendReply } from "@/app/admin/(protected)/enquiries/actions";

type Message = { id: string; body: string; createdAt: string; senderName: string };
type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  details: string;
  status: string;
  source: string;
  ownerId: string | null;
  ownerName: string | null;
  createdAt: string;
  messages: Message[];
};
type TeamMember = { id: string; name: string | null; email: string };

const FILTERS = ["ALL", ...ENQUIRY_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

const REPLY_TEMPLATES = (firstName: string) => [
  {
    label: "Book discovery call",
    body: `Hi ${firstName}, thanks for reaching out. I'd love to set up a quick discovery call to understand your requirements better — are you free this week?`,
  },
  {
    label: "Request details",
    body: `Hi ${firstName}, thanks for your enquiry. Could you share a bit more detail on your requirements — timeline, budget range, and specific goals — so we can put together an accurate proposal?`,
  },
  {
    label: "Send proposal",
    body: `Hi ${firstName}, thanks for your patience. We've put together a proposal based on what you shared and will send it over shortly — let us know if you have any questions in the meantime.`,
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function EnquiriesView({
  enquiries,
  users,
  initialSelectedId,
}: {
  enquiries: EnquiryRow[];
  users: TeamMember[];
  currentUserId: string;
  initialSelectedId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [replyDraft, setReplyDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const showToast = useAdminToast();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: enquiries.length, NEW: 0, CONTACTED: 0, PROPOSAL: 0, WON: 0, LOST: 0 };
    for (const e of enquiries) c[e.status as EnquiryStatus] = (c[e.status as EnquiryStatus] ?? 0) + 1;
    return c;
  }, [enquiries]);

  const filtered = filter === "ALL" ? enquiries : enquiries.filter((e) => e.status === filter);
  const selected = enquiries.find((e) => e.id === selectedId) ?? null;

  function handleStatusChange(status: EnquiryStatus) {
    if (!selected) return;
    startTransition(async () => {
      try {
        await updateEnquiryStatus(selected.id, status);
        showToast(`Status set to ${STATUS_LABEL[status]}`);
      } catch {
        showToast("Couldn't update status.");
      }
    });
  }

  function handleAssign(ownerId: string) {
    if (!selected) return;
    startTransition(async () => {
      try {
        await assignEnquiry(selected.id, ownerId || null);
        showToast("Assignment updated");
      } catch {
        showToast("Couldn't update assignment.");
      }
    });
  }

  function handleSendReply() {
    if (!selected || !replyDraft.trim()) return;
    startTransition(async () => {
      try {
        await sendReply(selected.id, replyDraft);
        setReplyDraft("");
        showToast("Reply sent");
      } catch {
        showToast("Couldn't send reply.");
      }
    });
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                filter === f
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-admin-border text-admin-muted hover:text-admin-text"
              }`}
            >
              {f === "ALL" ? "All" : STATUS_LABEL[f]} · {counts[f]}
            </button>
          ))}
        </div>
        <a
          href={`/api/admin/enquiries/export${filter !== "ALL" ? `?status=${filter}` : ""}`}
          className="rounded-pill border border-admin-border px-3.5 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:border-orange-400"
        >
          ↓ Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-x-auto rounded-[20px] border border-admin-border bg-admin-panel">
          <table className="w-full min-w-[820px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-admin-border text-[11px] font-mono tracking-[0.08em] text-admin-muted">
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`cursor-pointer border-b border-admin-border last:border-0 transition-colors hover:bg-admin-soft ${
                    selectedId === e.id ? "bg-admin-soft" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-admin-text">{e.name}</span>
                      {e.source === "Revenue check" && (
                        <span className="rounded-chip bg-chip-blue px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                          CHECK
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[12px] text-admin-muted">
                      {e.company ? `${e.company} · ` : ""}
                      {e.email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-admin-muted">{e.service}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={e.status} />
                  </td>
                  <td className="px-5 py-3.5 text-admin-muted">{e.ownerName ?? "Unassigned"}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-admin-muted">
                    No enquiries in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[19px] font-semibold text-admin-text">{selected.name}</h2>
                <p className="text-[13px] text-admin-muted">
                  {selected.company ? `${selected.company} · ` : ""}
                  {selected.source}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="text-admin-muted hover:text-admin-text"
              >
                ✕
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-admin-muted">Email</dt>
                <dd className="truncate text-admin-text">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-admin-muted">Phone</dt>
                <dd className="text-admin-text">{selected.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-admin-muted">Service</dt>
                <dd className="text-admin-text">{selected.service}</dd>
              </div>
              <div>
                <dt className="text-admin-muted">Received</dt>
                <dd className="text-admin-text">{formatDate(selected.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-admin-muted">PIPELINE</p>
              <div className="flex flex-wrap gap-1.5">
                {ENQUIRY_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(s)}
                    className={`rounded-pill border px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                      selected.status === s
                        ? `border-transparent text-white ${STATUS_COLOR_CLASS[s]}`
                        : "border-admin-border text-admin-muted hover:text-admin-text"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="grid gap-1.5">
                <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">ASSIGNED TO</span>
                <select
                  value={selected.ownerId ?? ""}
                  disabled={isPending}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="rounded-input border border-admin-border bg-admin-panel-2 px-3 py-2 text-[13px] text-admin-text"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-admin-muted">CONVERSATION</p>
              <div className="grid gap-2.5">
                <div className="rounded-xl bg-admin-panel-2 p-3 text-[13px] leading-[1.5] text-admin-text">
                  {selected.details}
                </div>
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className="ml-6 rounded-xl border border-blue-300/30 bg-chip-blue p-3 text-[13px] leading-[1.5] text-admin-text"
                  >
                    <p className="mb-1 text-[11px] font-medium text-blue-600">{m.senderName}</p>
                    {m.body}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-admin-muted">REPLY BY EMAIL</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {REPLY_TEMPLATES(selected.name.trim().split(" ")[0]).map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setReplyDraft(t.body)}
                    className="rounded-pill border border-admin-border px-3 py-1.5 text-[12px] text-admin-muted transition-colors hover:text-admin-text"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write a reply…"
                className="w-full rounded-input border border-admin-border bg-admin-panel-2 p-3 text-[13px] text-admin-text outline-none focus:border-orange-400"
              />
              <button
                type="button"
                disabled={isPending || !replyDraft.trim()}
                onClick={handleSendReply}
                className="mt-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
