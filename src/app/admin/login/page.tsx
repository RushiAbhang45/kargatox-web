import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signInWithPassword } from "./actions";

export const metadata: Metadata = {
  title: "Admin sign in — Kargatox",
};

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  TooManyAttempts: "Too many attempts. Wait a few minutes and try again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/admin");

  const { error } = await searchParams;
  const message = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Try again.") : null;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy-900 px-6 py-16 text-white">
      <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-navy-800 p-[clamp(28px,4vw,44px)]">
        <Logo />
        <p className="mt-1 font-mono text-xs tracking-[0.1em] text-mist-2">ADMIN</p>

        <h1 className="mt-6 font-display text-[28px] font-semibold tracking-[-0.02em]">Sign in</h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-mist">Enter your email and password to continue.</p>

        {message && (
          <p className="mt-4 rounded-xl border border-orange-400/40 bg-orange-400/10 px-3.5 py-3 text-[13px] text-orange-400">
            {message}
          </p>
        )}

        <form action={signInWithPassword} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="font-mono text-xs tracking-[0.1em] text-white">EMAIL</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@kargatox.com"
              className="rounded-xl border border-white/20 bg-transparent px-3.5 py-3 font-body text-[16px] text-white outline-none focus:border-orange-400"
            />
          </label>
          <label className="grid gap-2">
            <span className="font-mono text-xs tracking-[0.1em] text-white">PASSWORD</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="rounded-xl border border-white/20 bg-transparent px-3.5 py-3 font-body text-[16px] text-white outline-none focus:border-orange-400"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 py-3.5 font-body text-[16px] font-semibold text-white transition-colors hover:bg-orange-400"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
