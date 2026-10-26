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
  full: "text-[clamp(32px,3.6vw,48px)]",
  compact: "text-[clamp(24px,2.8vw,32px)]",
  tight: "text-[22px]",
};

const TITLE_SIZE: Record<Variant, string> = {
  full: "text-[clamp(19px,2.1vw,25px)] tracking-[-0.015em]",
  compact: "text-[17px] tracking-[-0.01em]",
  tight: "text-[15px] tracking-[-0.01em]",
};

const ROW_GAP: Record<Variant, string> = {
  full: "gap-5 py-6",
  compact: "gap-4 py-4",
  tight: "gap-2.5 py-3",
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
      ? "rounded-chip bg-orange-500/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-orange-600"
      : "font-mono text-[11px] uppercase tracking-[0.06em] text-mist-2";

  return (
    <RevealGroup className={className}>
      {items.map((item, i) => (
        <div
          key={item.num}
          className={`grid grid-cols-[auto_minmax(0,1fr)] border-t transition-colors duration-300 hover:border-orange-500/50 ${dividerClass} ${ROW_GAP[variant]}`}
        >
          <div className="grid content-start">
            <div className={`min-w-[1.2em] font-display font-semibold leading-[0.9] ${NUMERAL_SIZE[variant]} ${numeralClass}`}>
              {item.num}
            </div>
            <GrowBar
              axis="x"
              index={i}
              className={`mt-2 h-[2px] origin-left ${UNDERLINE_WIDTH[variant]} ${theme === "light" ? "bg-orange-500" : "bg-orange-400"}`}
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
              <p className={`max-w-[560px] text-[15px] leading-[1.6] ${bodyClass}`}>{item.body}</p>
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
