export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-navy-900 text-white">
        <div className="mx-auto w-full max-w-(--width-site) px-6 py-24">
          <div className="inline-flex items-center gap-2 rounded-pill border border-white/16 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Strategy · Research · Growth
          </div>
          <h1 className="mt-7 max-w-2xl font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
            Turning Ideas Into Products{" "}
            <span className="text-orange-400">That Grow.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist">
            Design tokens, fonts and radii are wired up. Pages come next.
          </p>
        </div>
      </section>
    </main>
  );
}
