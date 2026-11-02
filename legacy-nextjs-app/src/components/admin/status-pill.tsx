import { STATUS_COLOR_CLASS, STATUS_LABEL, type EnquiryStatus } from "@/lib/enquiry-status";

export function StatusPill({ status }: { status: string }) {
  const s = status as EnquiryStatus;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white ${
        STATUS_COLOR_CLASS[s] ?? "bg-status-lost"
      }`}
    >
      {STATUS_LABEL[s] ?? status}
    </span>
  );
}
