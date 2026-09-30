"use client";

import { Children, type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

export const EASE = [0.2, 0.7, 0.1, 1] as const;

const VIEWPORT = { once: true, amount: 0.12, margin: "0px 0px -40px 0px" } as const;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

/** Scroll-triggered opacity/translateY reveal for a single heading, paragraph or CTA. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

const STAGGER_STEP = 0.09;
const STAGGER_CYCLE = 6;

/** Wraps a list of cards/steps/rows, revealing each with a (index % 6) * 90ms stagger. */
export function RevealGroup({
  children,
  className,
  itemClassName,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={i}
          className={itemClassName}
          variants={revealVariants}
          custom={(i % STAGGER_CYCLE) * STAGGER_STEP}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/** Hero heading words that rise from translateY(110%) into place, left to right. */
export function RiseWords({
  words,
}: {
  words: { text: string; className?: string }[];
}) {
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            paddingBottom: "0.08em",
            verticalAlign: "top",
            marginRight: "0.18em",
          }}
        >
          <motion.span
            className={w.className}
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.08 }}
          >
            {w.text}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/** A single bar/fill that grows from 0 on the given axis when it scrolls into view. */
export function GrowBar({
  axis,
  index = 0,
  className,
  style,
}: {
  axis: "x" | "y";
  index?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={{ ...style, transformOrigin: axis === "x" ? "left" : "bottom" }}
      initial={axis === "x" ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={axis === "x" ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.2 + index * 0.05 }}
    />
  );
}
