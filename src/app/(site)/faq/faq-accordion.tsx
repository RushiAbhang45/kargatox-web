"use client";

import { useState } from "react";
import { RevealGroup } from "@/components/motion/reveal";

type FaqEntry = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <RevealGroup className="border-t border-line-2">
      {items.map((f, i) => {
        const open = openIndex === i;
        return (
          <div key={f.id} className="border-b border-line-2">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="flex w-full items-center justify-between gap-5 border-0 bg-none py-[18px] text-left font-display text-[17px] font-bold tracking-[-0.01em] text-ink"
            >
              <span>{f.question}</span>
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full font-body text-base ${
                  open ? "bg-orange-500 text-white" : "bg-chip-neutral text-ink"
                }`}
              >
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <p className="pb-5 pr-10 text-[14px] leading-[1.65] text-slate">{f.answer}</p>
            )}
          </div>
        );
      })}
    </RevealGroup>
  );
}
