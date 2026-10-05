import { RevealGroup, GrowBar } from "@/components/motion/reveal";

type NumberedRowItem = {
  num: string;
  title: string;
  body?: string;
  meta?: string;
};

type Variant = "full" | "compact" | "tight";
type Theme = "light" | "dark";

// Shared borderless numbered-row pattern — originally /how-we-work's step list
// (see git history), promoted to a reusable component so the Home page's hero
// pillars and "How We Work" teaser stop duplicating a separate hairline-grid
// recipe. One consistent visual language at three densities instead of three
// different card treatments.
const NUMERAL_SIZE: Record<Variant, string> = {
  full: "text-[clamp(48px,6vw,80px)]",
  compact: "text-[clamp(32px,4vw,44px)]",
  tight: "text-[28px]",
};

const TITLE_SIZE: Record<Variant, string> = {
  full: "text-[clamp(26px,3vw,36px)] tracking-[-0.02em]",
  compact: "text-xl tracking-[-0.01em]",
  tight: "text-lg tracking-[-0.01em]",
};

const ROW_GAP: Record<Variant, string> = {
  full: "gap-7 py-10",
  compact: "gap-5 py-6",
  tight: "gap-3 py-4",
};

const UNDERLINE_WIDTH: Record<Variant, string> = {
  full: "w-14",
  compact: "w-10",
  tight: "w-8",
};

export function NumberedRows({
  items,
  variant,
  theme,
  className,
}: {
  items: NumberedRowItem[];
  variant: Variant;
  theme: Theme;
  className?: string;
}) {
  const dividerClass = theme === "light" ? "border-line-2" : "border-white/12";
  const numeralClass = theme === "light" ? "text-orange-500" : "text-orange-400";
  const titleClass = theme === "light" ? "text-ink" : "text-white";
  const bodyClass = theme === "light" ? "text-slate" : "text-mist-2";
  const metaClass =
    theme === "light"
      ? "rounded-chip bg-chip-blue px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-ink"
      : "font-mono text-[11px] uppercase tracking-[0.06em] text-mist-2";

  return (
    <RevealGroup className={className}>
      {items.map((item, i) => (
        <div
          key={item.num}
          className={`grid grid-cols-[auto_minmax(0,1fr)] border-t transition-colors duration-300 hover:border-orange-400/50 ${dividerClass} ${ROW_GAP[variant]}`}
        >
          <div className="grid content-start">
            <div className={`min-w-[1.2em] font-display font-semibold leading-[0.9] ${NUMERAL_SIZE[variant]} ${numeralClass}`}>
              {item.num}
            </div>
            <GrowBar
              axis="x"
              index={i}
              className={`mt-2.5 h-[2px] origin-left ${UNDERLINE_WIDTH[variant]} ${theme === "light" ? "bg-orange-500" : "bg-orange-400"}`}
            />
          </div>
          <div className="grid gap-2.5 self-start">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              {variant === "full" ? (
                <h2 className={`font-display font-semibold ${TITLE_SIZE[variant]} ${titleClass}`}>{item.title}</h2>
              ) : (
                <h3 className={`font-display font-semibold ${TITLE_SIZE[variant]} ${titleClass}`}>{item.title}</h3>
              )}
              {item.meta && variant !== "tight" && (
                <span className={`whitespace-nowrap ${metaClass}`}>{item.meta}</span>
              )}
            </div>
            {variant === "full" && item.body && (
              <p className={`max-w-[680px] text-[18px] leading-[1.6] ${bodyClass}`}>{item.body}</p>
            )}
            {variant === "tight" && item.body && (
              <p className={`max-w-[320px] text-sm leading-[1.55] ${bodyClass}`}>{item.body}</p>
            )}
          </div>
        </div>
      ))}
    </RevealGroup>
  );
}
