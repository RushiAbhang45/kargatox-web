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
              className="flex w-full items-center justify-between gap-5 border-0 bg-none py-[26px] text-left font-display text-[22px] font-semibold tracking-[-0.01em] text-ink"
            >
              <span>{f.question}</span>
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-body text-xl ${
                  open ? "bg-blue-500 text-white" : "bg-chip-neutral text-ink"
                }`}
              >
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <p className="pb-7 pr-14 text-[17px] leading-[1.65] text-slate">{f.answer}</p>
            )}
          </div>
        );
      })}
    </RevealGroup>
  );
}
