export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-[20px] border border-admin-border bg-admin-panel p-10 text-center">
      <p className="font-display text-[20px] font-semibold text-admin-text">{title}</p>
      <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-[1.6] text-admin-muted">{note}</p>
    </div>
  );
}
