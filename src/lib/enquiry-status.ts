export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "PROPOSAL", "WON", "LOST"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

// Matches --color-status-* in globals.css (design_handoff_kargatox/README.md's
// Enquiry status colours).
export const STATUS_COLOR_CLASS: Record<EnquiryStatus, string> = {
  NEW: "bg-status-new",
  CONTACTED: "bg-status-contacted",
  PROPOSAL: "bg-status-proposal",
  WON: "bg-status-won",
  LOST: "bg-status-lost",
};
