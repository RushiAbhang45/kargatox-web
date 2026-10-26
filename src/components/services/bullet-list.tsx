import { Reveal } from "@/components/motion/reveal";

export function BulletList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <Reveal>
      <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.04em] text-ink">{heading}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[14px] leading-[1.6] text-slate">
            <span aria-hidden="true" className="mt-[2px] text-orange-500">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
