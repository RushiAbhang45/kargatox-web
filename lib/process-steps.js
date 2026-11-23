// Ported from legacy-nextjs-app/src/lib/process-steps.ts. Steps 3-5 bodies replaced per the
// client's 2026-11-02 change list (lightly proofread; titles/timings unchanged).
const PROCESS_STEPS = [
  {
    title: "We listen",
    when: "Days 1 to 7",
    body: "We sit in on your calls, talk to won and lost customers, and study your numbers. We learn what is actually happening before we touch anything.",
  },
  {
    title: "You get the plan",
    when: "Day 7",
    body: "By day 7, you know exactly what is costing you revenue and the plan to fix it. Prioritized, clear, no fluff.",
  },
  {
    title: "We build it",
    when: "Weeks 2 to 8",
    body: "We get into your marketing accounts and website and do the actual work your business needs to run efficiently, so you can focus on the other parts of the business.",
  },
  {
    title: "We fix what is costing you",
    when: "Weeks 4 to 10",
    body: "Be it SEO, design inconsistencies, differing visions or anything else the diagnosis called for. You see changes happening, not slides stacking up.",
  },
  {
    title: "You keep the system",
    when: "Weeks 11 to 12",
    body: "In marketing, the goal is not just keeping systems alive, it is making them work. We work the system to its fullest, and you own the achievements that come with it.",
  },
].map((step, i) => ({ ...step, num: String(i + 1).padStart(2, "0") }));

module.exports = { PROCESS_STEPS };
