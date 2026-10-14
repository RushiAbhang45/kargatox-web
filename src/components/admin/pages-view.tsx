"use client";

import { useState, useTransition } from "react";
import { useAdminToast } from "@/components/admin/toast";
import { PAGE_FIELDS, PAGE_LABELS, PAGE_ROUTES, type PageKey } from "@/lib/page-content-defaults";
import { savePageDraft, publishPage } from "@/app/admin/(protected)/pages/actions";

type PageRow = {
  page: PageKey;
  published: Record<string, string>;
  draft: Record<string, string> | null;
};

export function PagesView({ pages }: { pages: PageRow[] }) {
  const [selected, setSelected] = useState<PageKey>(pages[0].page);
  const [values, setValues] = useState<Record<string, string>>(
    () => pages.find((p) => p.page === selected)?.draft ?? pages.find((p) => p.page === selected)!.published
  );
  const [isPending, startTransition] = useTransition();
  const showToast = useAdminToast();

  function selectPage(page: PageKey) {
    setSelected(page);
    const row = pages.find((p) => p.page === page)!;
    setValues(row.draft ?? row.published);
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await savePageDraft(selected, values);
      showToast(result.ok ? "Draft saved" : result.error);
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishPage(selected, values);
      showToast(result.ok ? "Published" : result.error);
    });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[20px] border border-admin-border bg-admin-panel">
        {pages.map((row) => {
          const active = row.page === selected;
          const pending = row.draft !== null;
          return (
            <button
              key={row.page}
              type="button"
              onClick={() => selectPage(row.page)}
              className={`flex w-full items-center gap-2.5 border-b border-admin-border px-5 py-3.5 text-left text-[14px] font-medium transition-colors last:border-0 ${
                active ? "bg-admin-soft text-admin-text" : "text-admin-muted hover:text-admin-text"
              }`}
            >
              <span
                className={`h-2 w-2 flex-none rounded-full ${pending ? "bg-orange-500" : "bg-success"}`}
                aria-label={pending ? "Unpublished changes" : "Published"}
              />
              {PAGE_LABELS[row.page]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-[18px] rounded-[20px] border border-admin-border bg-admin-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[18px] font-semibold text-admin-text">{PAGE_LABELS[selected]}</h2>
          <a
            href={PAGE_ROUTES[selected]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-admin-muted transition-colors hover:text-orange-500"
          >
            Preview ↗
          </a>
        </div>

        <div className="grid gap-4">
          {PAGE_FIELDS[selected].map((field) => (
            <label key={field.key} className="grid gap-1.5">
              <span className="font-mono text-[11px] tracking-[0.08em] text-admin-muted">{field.label}</span>
              {field.multiline ? (
                <textarea
                  rows={4}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
                />
              ) : (
                <input
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] text-admin-text outline-none focus:border-orange-400"
                />
              )}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="rounded-pill border border-admin-border px-4 py-2 text-[13px] font-semibold text-admin-text transition-colors hover:border-orange-400 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
            className="rounded-pill bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
