import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import { acceptInvite } from "./actions";

export const metadata: Metadata = { title: "Accept invite — Kargatox Admin" };

const ERROR_MESSAGES: Record<string, string> = {
  PasswordMismatch: "Passwords don't match.",
  WeakPassword: `Password must be at least 8 characters.`,
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  const verification = token ? await prisma.verificationToken.findFirst({ where: { token } }) : null;
  const invalid = error === "InvalidToken" || !verification || verification.expires < new Date();

  const message = !invalid && error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Try again.") : null;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy-900 px-6 py-16 text-white">
      <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-navy-800 p-[clamp(28px,4vw,44px)]">
        <Logo />
        <p className="mt-1 font-mono text-xs tracking-[0.1em] text-mist-2">ADMIN</p>

        {invalid ? (
          <>
            <h1 className="mt-6 font-display text-[28px] font-semibold tracking-[-0.02em]">Invite not found</h1>
            <p className="mt-2 text-[15px] leading-[1.6] text-mist">
              This invite link is invalid or has expired. Ask an owner or admin to send a new one.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-display text-[28px] font-semibold tracking-[-0.02em]">Set your password</h1>
            <p className="mt-2 text-[15px] leading-[1.6] text-mist">
              You&apos;ve been invited to the Kargatox admin panel. Set a password to finish.
            </p>

            {message && (
              <p className="mt-4 rounded-xl border border-orange-400/40 bg-orange-400/10 px-3.5 py-3 text-[13px] text-orange-400">
                {message}
              </p>
            )}

            <form action={acceptInvite} className="mt-6 grid gap-4">
              <input type="hidden" name="token" value={token} />
              <label className="grid gap-2">
                <span className="font-mono text-xs tracking-[0.1em] text-white">PASSWORD</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="rounded-xl border border-white/20 bg-transparent px-3.5 py-3 font-body text-[16px] text-white outline-none focus:border-orange-400"
                />
              </label>
              <label className="grid gap-2">
                <span className="font-mono text-xs tracking-[0.1em] text-white">CONFIRM PASSWORD</span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="rounded-xl border border-white/20 bg-transparent px-3.5 py-3 font-body text-[16px] text-white outline-none focus:border-orange-400"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-orange-500 py-3.5 font-body text-[16px] font-semibold text-white transition-colors hover:bg-orange-400"
              >
                Set password &amp; sign in
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
