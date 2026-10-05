import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Check your email — Kargatox Admin",
};

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy-900 px-6 py-16 text-white">
      <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-navy-800 p-[clamp(28px,4vw,44px)] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl">
          ✓
        </div>
        <Logo className="mt-6 justify-center" />
        <h1 className="mt-6 font-display text-[26px] font-semibold tracking-[-0.02em]">
          Check your sign-in link
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-mist">
          A one-time link was requested. Since email sending isn&apos;t wired up yet, find it in the dev
          server&apos;s console/log — look for a line starting with <code className="text-orange-400">[auth] Magic link for…</code>
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block rounded-pill border border-white/25 px-[22px] py-3 text-[15px] font-semibold text-white transition-colors hover:border-orange-400"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
