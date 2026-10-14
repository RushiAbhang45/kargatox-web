"use client";

import { useState, useTransition } from "react";
import { useAdminToast } from "@/components/admin/toast";
import { INVITE_ROLE_OPTIONS } from "@/lib/team-schema";
import type { Role } from "@/lib/roles";
import { inviteMember, removeMember, updateMemberRole } from "@/app/admin/(protected)/team/actions";

const MAX_SEATS = 5;

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lastActiveAt: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
};

// README's Team section role cards, verbatim.
const ROLE_CARDS: { role: Role; description: string }[] = [
  { role: "OWNER", description: "Everything, including billing." },
  { role: "ADMIN", description: "All content, enquiries, settings and team." },
  { role: "EDITOR", description: "Pages, services, FAQ and blog." },
  { role: "SALES", description: "Enquiries and revenue checks; can reply and export." },
];

function formatLastActive(member: Member) {
  if (member.lastActiveAt) {
    return new Date(member.lastActiveAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return member.acceptedAt ? "Never signed in" : "Invited — pending";
}

export function TeamView({ members, currentUserId }: { members: Member[]; currentUserId: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showToast = useAdminToast();

  const seatsUsed = members.length;
  const seatsFull = seatsUsed >= MAX_SEATS;

  function handleInvite(formData: FormData) {
    startTransition(async () => {
      const result = await inviteMember(formData);
      if (result.ok) {
        showToast("Invite sent");
        setInviteOpen(false);
      } else {
        showToast(result.error);
      }
    });
  }

  function handleRoleChange(userId: string, role: Role) {
    startTransition(async () => {
      const result = await updateMemberRole(userId, role);
      showToast(result.ok ? "Role updated" : result.error);
    });
  }

  function handleRemove(member: Member) {
    if (!confirm(`Remove ${member.name ?? member.email} from the team?`)) return;
    startTransition(async () => {
      const result = await removeMember(member.id);
      showToast(result.ok ? "Member removed" : result.error);
    });
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-admin-border bg-admin-panel px-5 py-4">
        <p className="text-[14px] font-medium text-admin-text">
          {seatsUsed} of {MAX_SEATS} seats used
        </p>
        <button
          type="button"
          onClick={() => setInviteOpen((v) => !v)}
          disabled={seatsFull && !inviteOpen}
          className="rounded-pill bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inviteOpen ? "Cancel" : "+ Invite member"}
        </button>
      </div>

      {inviteOpen && (
        <form
          action={handleInvite}
          className="grid gap-3 rounded-[20px] border border-admin-border bg-admin-panel p-5 sm:grid-cols-[1fr_1fr_160px_auto]"
        >
          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">NAME</span>
            <input
              name="name"
              required
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">EMAIL</span>
            <input
              type="email"
              name="email"
              required
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">ROLE</span>
            <select
              name="role"
              defaultValue="SALES"
              className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
            >
              {INVITE_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="self-end rounded-pill bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
          >
            Send invite
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-[20px] border border-admin-border bg-admin-panel">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-admin-border text-[11px] font-mono tracking-[0.08em] text-admin-muted">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Last active</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isOwner = member.role === "OWNER";
              return (
                <tr key={member.id} className="border-b border-admin-border last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-orange-500 text-[12px] font-semibold text-white">
                        {(member.name ?? member.email).charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-admin-text">
                          {member.name ?? member.email}
                          {member.id === currentUserId && (
                            <span className="ml-1.5 text-[12px] font-normal text-admin-muted">(you)</span>
                          )}
                        </p>
                        <p className="truncate text-[12px] text-admin-muted">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {isOwner ? (
                      <span className="font-mono text-[12px] tracking-[0.06em] text-admin-muted">OWNER</span>
                    ) : (
                      <select
                        defaultValue={member.role}
                        disabled={isPending}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                        className="rounded-input border border-admin-border bg-admin-bg px-2.5 py-1.5 text-[13px] text-admin-text outline-none focus:border-orange-400"
                      >
                        {INVITE_ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-admin-muted">{formatLastActive(member)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemove(member)}
                        disabled={isPending}
                        aria-label={`Remove ${member.name ?? member.email}`}
                        className="rounded-[8px] px-2 py-1 text-admin-muted transition-colors hover:text-orange-500 disabled:opacity-50"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_CARDS.map((card) => (
          <div key={card.role} className="rounded-[16px] border border-admin-border bg-admin-panel p-4">
            <p className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">{card.role}</p>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-admin-text">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
