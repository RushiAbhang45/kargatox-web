// Ported from legacy-nextjs-app/src/lib/enquiry-status.ts verbatim. Colour classes match
// --color-status-* in public/css/input.css's @theme inline block.
const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "PROPOSAL", "WON", "LOST"];

const STATUS_LABEL = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

const STATUS_COLOR_CLASS = {
  NEW: "bg-status-new",
  CONTACTED: "bg-status-contacted",
  PROPOSAL: "bg-status-proposal",
  WON: "bg-status-won",
  LOST: "bg-status-lost",
};

module.exports = { ENQUIRY_STATUSES, STATUS_LABEL, STATUS_COLOR_CLASS };
