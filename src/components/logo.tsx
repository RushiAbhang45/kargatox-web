import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 text-white ${className ?? ""}`}>
      <span className="relative block h-[30px] w-[30px]">
        <span className="absolute left-0 top-0 h-5 w-5 rounded-[5px] bg-orange-500" />
        <span className="absolute bottom-0 right-0 h-5 w-5 rounded-[5px] bg-blue-500 mix-blend-screen" />
      </span>
      <span className="font-display text-[22px] font-bold tracking-[-0.02em] text-white">
        Karga<span className="text-orange-400">tox</span>
      </span>
    </Link>
  );
}
