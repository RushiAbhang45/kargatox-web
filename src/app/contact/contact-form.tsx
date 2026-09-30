"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const SERVICE_OPTIONS = [
  "General Inquiry",
  "Market Research",
  "Consumer Behaviour & Satisfaction Analysis",
  "Campaign Analytics",
  "SEO Services",
  "Social Media Marketing",
  "Brand Campaigns Strategy",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "General Inquiry",
  details: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

export function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(() => {
    const service = searchParams.get("service");
    const note = searchParams.get("note");
    return {
      ...EMPTY_FORM,
      service: service || EMPTY_FORM.service,
      details: note ? note + "\n\n" : EMPTY_FORM.details,
    };
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((err) => ({ ...err, [key]: undefined }));
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Please enter a valid email";
    if (!form.details.trim()) errs.details = "Please tell us a little about your requirements";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Submits nowhere yet — POST /api/enquiries lands in the next build step.
    setSent(true);
  }

  const firstName = form.name.trim().split(" ")[0];

  if (sent) {
    return (
      <div className="rounded-3xl border border-white/10 bg-navy-800 p-[clamp(24px,4vw,48px)]">
        <div className="grid justify-items-center gap-[18px] py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-[28px] text-white">
            ✓
          </div>
          <h2 className="font-display text-[32px] font-semibold tracking-[-0.02em]">Thanks, {firstName}.</h2>
          <p className="max-w-[380px] text-[17px] leading-[1.6] text-mist">
            Your inquiry is in. Our team will review your scope and reply to {form.email} within one
            business day.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setErrors({});
              setForm(EMPTY_FORM);
            }}
            className="mt-2 rounded-pill border border-white/25 bg-transparent px-[22px] py-3 text-[15px] font-semibold text-white"
          >
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  const lineColor = (key: keyof FormState) => (errors[key] ? "border-orange-400" : "border-white/20");

  return (
    <div className="rounded-3xl border border-white/10 bg-navy-800 p-[clamp(24px,4vw,48px)]">
      <form onSubmit={submit} noValidate className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-8 gap-y-8">
        <label className="grid gap-2.5">
          <span className="font-mono text-xs tracking-[0.1em] text-white">FULL NAME *</span>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
            className={`border-0 border-b bg-transparent py-2.5 font-body text-[17px] text-white outline-none focus:border-orange-400 ${lineColor("name")}`}
          />
          <span className="min-h-4 text-[13px] text-orange-400">{errors.name}</span>
        </label>

        <label className="grid gap-2.5">
          <span className="font-mono text-xs tracking-[0.1em] text-white">WORK EMAIL *</span>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@company.com"
            className={`border-0 border-b bg-transparent py-2.5 font-body text-[17px] text-white outline-none focus:border-orange-400 ${lineColor("email")}`}
          />
          <span className="min-h-4 text-[13px] text-orange-400">{errors.email}</span>
        </label>

        <label className="grid gap-2.5">
          <span className="font-mono text-xs tracking-[0.1em] text-white">
            PHONE NUMBER <span className="text-[#6b7695]">(optional)</span>
          </span>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 98765 43210"
            className="border-0 border-b border-white/20 bg-transparent py-2.5 font-body text-[17px] text-white outline-none focus:border-orange-400"
          />
        </label>

        <label className="grid gap-2.5">
          <span className="font-mono text-xs tracking-[0.1em] text-white">SERVICE REQUIRED</span>
          <select
            value={form.service}
            onChange={set("service")}
            className="cursor-pointer border-0 border-b border-white/20 bg-transparent py-2.5 font-body text-[17px] text-white outline-none focus:border-orange-400"
          >
            {SERVICE_OPTIONS.map((o) => (
              <option key={o} value={o} className="text-ink">
                {o}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2.5 col-span-full">
          <span className="font-mono text-xs tracking-[0.1em] text-white">PROJECT DETAILS *</span>
          <textarea
            rows={4}
            value={form.details}
            onChange={set("details")}
            placeholder="Tell us about your requirements..."
            className={`resize-y border-0 border-b bg-transparent py-2.5 font-body text-[17px] text-white outline-none focus:border-orange-400 ${lineColor("details")}`}
          />
          <span className="min-h-4 text-[13px] text-orange-400">{errors.details}</span>
        </label>

        <button
          type="submit"
          className="rounded-xl bg-orange-500 py-[18px] font-body text-[17px] font-semibold text-white transition-colors hover:bg-orange-400 col-span-full"
        >
          Submit Inquiry
        </button>
      </form>
    </div>
  );
}
