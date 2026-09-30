export const PROCESS_STEPS = [
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
    body: "We get into your CRM, your tools, your team. We do the actual work and wire the fixes into how you already operate.",
  },
  {
    title: "We fix what is costing you",
    when: "Weeks 4 to 10",
    body: "Outbound, sales motion, retention systems, whatever the diagnosis called for. You see changes happening, not slides stacking up.",
  },
  {
    title: "You keep the system",
    when: "Weeks 11 to 12",
    body: "We hand over the playbooks, dashboards, and a clear hire-or-don't-hire call. Your team owns it from here. The growth stays when we go.",
  },
].map((step, i) => ({ ...step, num: String(i + 1).padStart(2, "0") }));
