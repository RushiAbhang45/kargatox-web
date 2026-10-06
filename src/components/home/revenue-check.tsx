"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal, GrowBar } from "@/components/motion/reveal";

type AreaKey = "leads" | "sales" | "retention";

// Not cryptographic — just a per-browser-session id to group RevenueCheck
// rows (README's `sessionId` field). `crypto.randomUUID` isn't guaranteed
// across every Node version this renders under on the server, so fall back.
function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const QUESTIONS: {
  key: AreaKey;
  area: string;
  text: string;
  options: [string, 0 | 1 | 2][];
}[] = [
  {
    key: "leads",
    area: "Leads",
    text: "How predictable is your lead flow?",
    options: [
      ["Steady and growing", 2],
      ["Up and down month to month", 1],
      ["Mostly referrals or luck", 0],
    ],
  },
  {
    key: "sales",
    area: "Sales",
    text: "How many qualified leads turn into customers?",
    options: [
      ["Most of them", 2],
      ["Some, but deals stall", 1],
      ["We don't track this", 0],
    ],
  },
  {
    key: "retention",
    area: "Retention",
    text: "How many customers come back or renew?",
    options: [
      ["Most of them", 2],
      ["Some of them", 1],
      ["We rarely hear from them again", 0],
    ],
  },
];

const RESULTS: Record<AreaKey, { title: string; body: string; services: string[]; service: string }> = {
  leads: {
    title: "Your biggest gap is lead flow.",
    body: "Fewer qualified people are finding you than your business can handle. We would start with search visibility and social engagement so demand becomes predictable.",
    services: ["SEO Services", "Social Media Marketing"],
    service: "SEO Services",
  },
  sales: {
    title: "Your biggest gap is conversion.",
    body: "Leads are coming in but not closing. We would study won and lost customers and your numbers to find where deals stall, then fix the sales motion.",
    services: ["Consumer Behaviour & Satisfaction Analysis", "Campaign Analytics"],
    service: "Campaign Analytics",
  },
  retention: {
    title: "Your biggest gap is retention.",
    body: "Customers are not coming back often enough. We would decode why they leave, then build retention systems and campaigns that keep them engaged.",
    services: ["Consumer Behaviour & Satisfaction Analysis", "Brand Campaigns Strategy"],
    service: "Brand Campaigns Strategy",
  },
};

const STATUS = ["Leaking", "Needs work", "Healthy"];
const METER_COLOR = ["bg-orange-400", "bg-white/40", "bg-success-dark"];
const METER_TEXT = ["text-orange-400", "text-mist-2", "text-success-dark"];
const METER_WIDTH = ["28%", "62%", "100%"];

export function RevenueCheck() {
  const [answers, setAnswers] = useState<(0 | 1 | 2 | null)[]>([null, null, null]);
  const [step, setStep] = useState(0);
  const [sessionId] = useState(createSessionId);
  const [checkId, setCheckId] = useState<string | null>(null);
  const submittedForRef = useRef<string | null>(null);

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const answered = answers.filter((v): v is 0 | 1 | 2 => v != null);
  const scoreLabel = answered.length ? String(answered.reduce<number>((a, b) => a + b, 0)) + "/6" : "–";

  let weakestIndex = 0;
  if (done) {
    answers.forEach((v, i) => {
      if ((v as number) < (answers[weakestIndex] as number)) weakestIndex = i;
    });
  }
  const weakest = QUESTIONS[weakestIndex];

  // README: "POST each completed check to /api/revenue-checks ... and link
  // it to the enquiry if the visitor submits one." The ref guards against
  // re-posting the same completed answer set (re-renders, Strict Mode's
  // double-invoke in dev); a Retake clears it so the next completion posts
  // again as a new row.
  useEffect(() => {
    if (!done) return;
    const signature = answers.join(",");
    if (submittedForRef.current === signature) return;
    submittedForRef.current = signature;

    fetch("/api/revenue-checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leads: answers[0],
        sales: answers[1],
        retention: answers[2],
        weakest: weakest.key,
        sessionId,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCheckId(data?.id ?? null))
      .catch(() => {});
  }, [done, answers, weakest.key, sessionId]);

  let result: (typeof RESULTS)[AreaKey] & { href: string; cta: string; title: string } = {
    ...RESULTS.leads,
    href: "/contact",
    cta: "",
  };
  if (done) {
    const r = RESULTS[weakest.key];
    const allPerfect = answers.every((v) => v === 2);
    result = {
      ...r,
      title: allPerfect ? "You're in good shape. Let's find the next lever." : r.title,
      href:
        "/contact?service=" +
        encodeURIComponent(r.service) +
        "&note=" +
        encodeURIComponent("Revenue check result: " + weakest.area + " needs attention.") +
        (checkId ? "&checkId=" + encodeURIComponent(checkId) : ""),
      cta: `Fix my ${weakest.area.toLowerCase()} →`,
    };
  }

  function pick(value: 0 | 1 | 2) {
    setAnswers((a) => {
      const next = [...a];
      next[step] = value;
      return next;
    });
    setStep((s) => s + 1);
  }

  function retake() {
    setAnswers([null, null, null]);
    setStep(0);
    setCheckId(null);
    submittedForRef.current = null;
  }

  return (
    <section className="px-6 pb-[120px]">
      <div className="mx-auto grid max-w-(--width-site) grid-cols-1 overflow-hidden rounded-panel border border-line bg-white min-[880px]:grid-cols-2">
        <div className="grid content-start gap-[22px] p-[clamp(28px,5vw,56px)]">
          <span className="font-mono text-[13px] tracking-[0.12em] text-blue-600">
            REVENUE CHECK · 30 SECONDS
          </span>
          <h2 className="font-display text-[clamp(34px,4vw,54px)] font-semibold leading-[1.02] tracking-[-0.02em]">
            Where is your revenue <span className="text-blue-600">leaking?</span>
          </h2>
          <p className="text-[18px] leading-[1.6] text-slate">
            Answer three questions. We&apos;ll show you which area to fix first.
          </p>

          {!done && (
            <div className="mt-3 grid gap-[18px]">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-1 gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-[400ms] ${
                        i < step ? "bg-blue-500" : i === step ? "bg-ink" : "bg-chip-neutral"
                      }`}
                    />
                  ))}
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-[#737373]">
                  {Math.min(step, 2) + 1} / 3
                </span>
              </div>

              <span className="w-fit rounded-chip bg-[#e8f0ff] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
                {current.area}
              </span>
              <h3 className="font-display text-[clamp(24px,2.4vw,30px)] font-semibold tracking-[-0.01em]">
                {current.text}
              </h3>
              <div className="grid gap-2.5">
                {current.options.map(([label, value]) => {
                  const selected = answers[step] === value;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => pick(value)}
                      className={`flex items-center justify-between gap-4 rounded-[14px] border-[1.5px] px-5 py-[18px] text-left text-[17px] font-medium text-ink transition-[border-color,transform] duration-300 hover:translate-x-1 hover:border-blue-500 ${
                        selected ? "border-blue-500 bg-[#e8f0ff]" : "border-line bg-white"
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-blue-500">→</span>
                    </button>
                  );
                })}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="w-fit border-0 bg-transparent p-0 text-[15px] font-semibold text-slate"
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {done && (
            <div className="mt-3 grid gap-[18px]">
              <span className="w-fit rounded-chip bg-blue-500 px-3 py-1.5 font-mono text-xs tracking-[0.08em] text-white">
                YOUR RESULT
              </span>
              <h3 className="font-display text-[clamp(26px,2.8vw,36px)] font-semibold tracking-[-0.015em]">
                {result.title}
              </h3>
              <p className="text-[17px] leading-[1.6] text-slate">{result.body}</p>
              <div className="grid gap-2.5">
                <span className="font-mono text-xs tracking-[0.1em] text-[#737373]">WHERE WE&apos;D START</span>
                <div className="flex flex-wrap gap-2">
                  {result.services.map((s) => (
                    <Link
                      key={s}
                      href="/services"
                      className="rounded-chip bg-chip-blue px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#e5e5e5]"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  href={result.href}
                  className="rounded-pill bg-blue-500 px-6 py-[15px] text-base font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  {result.cta}
                </Link>
                <button
                  type="button"
                  onClick={retake}
                  className="rounded-input border border-line-2 bg-transparent px-6 py-[15px] text-base font-semibold text-ink"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid content-start gap-7 bg-navy-900 p-[clamp(28px,5vw,56px)] text-white">
          <Reveal className="grid gap-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-xs tracking-[0.12em] text-mist-2">REVENUE HEALTH</span>
              <span className="font-display text-[44px] font-semibold leading-none">{scoreLabel}</span>
            </div>
            <GrowBar axis="x" className="h-[2px] w-14 origin-left bg-blue-300" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-[26px]">
            {QUESTIONS.map((question, i) => {
              const v = answers[i];
              const label = v == null ? "Not answered" : STATUS[v];
              const width = v == null ? "8%" : METER_WIDTH[v];
              const colorClass = v == null ? "bg-white/30" : METER_COLOR[v];
              const textClass = v == null ? "text-white/50" : METER_TEXT[v];
              return (
                <div key={question.key} className="grid gap-2.5">
                  <div className="flex justify-between gap-3">
                    <span className="font-display text-[22px] font-semibold">{question.area}</span>
                    <span className={`self-center font-mono text-xs uppercase tracking-[0.06em] ${textClass}`}>
                      {label}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-[10px] bg-white/10">
                    <div
                      className={`h-full rounded-[10px] transition-[width] duration-[900ms] ease-[var(--ease-kx)] ${colorClass}`}
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </Reveal>
          <p className="text-sm text-mist-2">Updates as you answer.</p>
        </div>
      </div>
    </section>
  );
}
