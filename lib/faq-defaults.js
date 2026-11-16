// Ported from legacy-nextjs-app/src/lib/faq-defaults.ts verbatim — fallback FAQ items
// until FaqItem DB rows exist (Phase 2 wires the DB-backed version).
const FAQ_DEFAULTS = [
  {
    question: "What exactly do you do?",
    answer:
      "We fix what is stopping your revenue from growing, across three areas: leads, sales, and retention. We find what is broken, do the actual work to fix it, and leave you with a system your team can run. Not advice, not a deck, real work.",
  },
  {
    question: "How fast can you start?",
    answer:
      "Quickly. You get a clear plan of what is broken and how we will fix it within 7 days of starting. Real changes follow in the weeks after.",
  },
  {
    question: "Do you replace a full-time hire?",
    answer:
      "Often, yes, at least for a while. We also help you figure out whether you actually need that senior hire yet, and if you do, we help you hire the right person.",
  },
  {
    question: "What does it cost?",
    answer:
      "Flat-fee engagements, scoped to your stage and what needs fixing. Roughly the cost of one senior hire, for a full team. We give you an exact number on the call, no hidden pricing.",
  },
];

// Shared "default until a row exists" merge, used by both the admin Services & FAQ editor
// (routes/admin.js) and the public /faq page (routes/site.js, Phase 2).
function faqItemsFromRows(faqRows) {
  return faqRows.length > 0
    ? faqRows.map((r) => ({ question: r.question, answer: r.answer }))
    : FAQ_DEFAULTS.map((f) => ({ question: f.question, answer: f.answer }));
}

module.exports = { FAQ_DEFAULTS, faqItemsFromRows };
