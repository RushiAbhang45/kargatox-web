"use client";

import { useState } from "react";
import { RevealGroup } from "@/components/motion/reveal";

const FAQS = [
  {
    q: "What exactly do you do?",
    a: "We fix what is stopping your revenue from growing, across three areas: leads, sales, and retention. We find what is broken, do the actual work to fix it, and leave you with a system your team can run. Not advice, not a deck, real work.",
  },
  {
    q: "How fast can you start?",
    a: "Quickly. You get a clear plan of what is broken and how we will fix it within 7 days of starting. Real changes follow in the weeks after.",
  },
  {
    q: "Do you replace a full-time hire?",
    a: "Often, yes, at least for a while. We also help you figure out whether you actually need that senior hire yet, and if you do, we help you hire the right person.",
  },
  {
    q: "What does it cost?",
    a: "Flat-fee engagements, scoped to your stage and what needs fixing. Roughly the cost of one senior hire, for a full team. We give you an exact number on the call, no hidden pricing.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <RevealGroup className="border-t border-line-2">
      {FAQS.map((f, i) => {
        const open = openIndex === i;
        return (
          <div key={f.q} className="border-b border-line-2">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="flex w-full items-center justify-between gap-5 border-0 bg-none py-[26px] text-left font-display text-[22px] font-semibold tracking-[-0.01em] text-ink"
            >
              <span>{f.q}</span>
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-body text-xl ${
                  open ? "bg-blue-500 text-white" : "bg-chip-neutral text-ink"
                }`}
              >
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <p className="pb-7 pr-14 text-[17px] leading-[1.65] text-slate">{f.a}</p>
            )}
          </div>
        );
      })}
    </RevealGroup>
  );
}
