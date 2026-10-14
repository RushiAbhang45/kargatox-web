"use client";

import { useState, useTransition } from "react";
import { useAdminToast } from "@/components/admin/toast";
import { saveServicesAndFaq } from "@/app/admin/(protected)/services-faq/actions";

type SubServiceRow = { title: string; body: string; link: string | null };
type FaqRow = { question: string; answer: string };
type ServiceMeta = { id: string; title: string };

function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function RowControls({
  index,
  count,
  onUp,
  onDown,
  onRemove,
}: {
  index: number;
  count: number;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-none gap-1">
      <button
        type="button"
        onClick={onUp}
        disabled={index === 0}
        aria-label="Move up"
        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-admin-muted transition-colors hover:text-admin-text disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={index === count - 1}
        aria-label="Move down"
        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-admin-muted transition-colors hover:text-admin-text disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-admin-muted transition-colors hover:text-orange-500"
      >
        ✕
      </button>
    </div>
  );
}

export function ServicesFaqView({
  services,
  subServicesByKey,
  faqItems,
}: {
  services: ServiceMeta[];
  subServicesByKey: Record<string, SubServiceRow[]>;
  faqItems: FaqRow[];
}) {
  const [tab, setTab] = useState<"services" | "faq">("services");
  const [subServices, setSubServices] = useState(subServicesByKey);
  const [faq, setFaq] = useState(faqItems);
  const [isPending, startTransition] = useTransition();
  const showToast = useAdminToast();

  function updateSubService(serviceId: string, index: number, patch: Partial<SubServiceRow>) {
    setSubServices((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function addSubService(serviceId: string) {
    setSubServices((prev) => ({
      ...prev,
      [serviceId]: [...prev[serviceId], { title: "", body: "", link: null }],
    }));
  }

  function removeSubService(serviceId: string, index: number) {
    setSubServices((prev) => ({ ...prev, [serviceId]: prev[serviceId].filter((_, i) => i !== index) }));
  }

  function reorderSubService(serviceId: string, index: number, dir: -1 | 1) {
    setSubServices((prev) => ({ ...prev, [serviceId]: moveItem(prev[serviceId], index, dir) }));
  }

  function updateFaq(index: number, patch: Partial<FaqRow>) {
    setFaq((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveServicesAndFaq(subServices, faq);
      showToast(result.ok ? "Changes saved" : result.error);
    });
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex gap-2">
        {(["services", "faq"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-pill border px-4 py-2 text-[13px] font-medium transition-colors ${
              tab === t
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-admin-border text-admin-muted hover:text-admin-text"
            }`}
          >
            {t === "services" ? "Services" : "FAQ"}
          </button>
        ))}
      </div>

      {tab === "services" && (
        <div className="grid gap-[18px]">
          {services.map((svc) => (
            <div key={svc.id} className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
              <h2 className="font-display text-[16px] font-semibold text-admin-text">{svc.title}</h2>
              <div className="mt-4 grid gap-3">
                {subServices[svc.id].map((row, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-[14px] border border-admin-border p-4">
                    <div className="grid gap-2.5">
                      <input
                        placeholder="Title"
                        value={row.title}
                        onChange={(e) => updateSubService(svc.id, index, { title: e.target.value })}
                        className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] font-medium text-admin-text outline-none focus:border-orange-400"
                      />
                      <textarea
                        placeholder="Body"
                        rows={3}
                        value={row.body}
                        onChange={(e) => updateSubService(svc.id, index, { body: e.target.value })}
                        className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[13px] text-admin-text outline-none focus:border-orange-400"
                      />
                      <input
                        placeholder='Link text (optional, e.g. "Click here")'
                        value={row.link ?? ""}
                        onChange={(e) => updateSubService(svc.id, index, { link: e.target.value || null })}
                        className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[13px] text-admin-text outline-none focus:border-orange-400"
                      />
                    </div>
                    <RowControls
                      index={index}
                      count={subServices[svc.id].length}
                      onUp={() => reorderSubService(svc.id, index, -1)}
                      onDown={() => reorderSubService(svc.id, index, 1)}
                      onRemove={() => removeSubService(svc.id, index)}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addSubService(svc.id)}
                className="mt-3 rounded-pill border border-admin-border px-4 py-2 text-[13px] font-medium text-admin-text transition-colors hover:border-orange-400"
              >
                + Add sub-service
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "faq" && (
        <div className="rounded-[20px] border border-admin-border bg-admin-panel p-5">
          <div className="grid gap-3">
            {faq.map((row, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-[14px] border border-admin-border p-4">
                <div className="grid gap-2.5">
                  <input
                    placeholder="Question"
                    value={row.question}
                    onChange={(e) => updateFaq(index, { question: e.target.value })}
                    className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[14px] font-medium text-admin-text outline-none focus:border-orange-400"
                  />
                  <textarea
                    placeholder="Answer"
                    rows={3}
                    value={row.answer}
                    onChange={(e) => updateFaq(index, { answer: e.target.value })}
                    className="rounded-input border border-admin-border bg-admin-bg px-3 py-2 text-[13px] text-admin-text outline-none focus:border-orange-400"
                  />
                </div>
                <RowControls
                  index={index}
                  count={faq.length}
                  onUp={() => setFaq((prev) => moveItem(prev, index, -1))}
                  onDown={() => setFaq((prev) => moveItem(prev, index, 1))}
                  onRemove={() => setFaq((prev) => prev.filter((_, i) => i !== index))}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFaq((prev) => [...prev, { question: "", answer: "" }])}
            className="mt-3 rounded-pill border border-admin-border px-4 py-2 text-[13px] font-medium text-admin-text transition-colors hover:border-orange-400"
          >
            + Add question
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-pill bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
