// Ported from legacy-nextjs-app/src/lib/text-split.ts — plain string helpers, no changes.
// Let an admin-editable plain-text field reproduce the two-tone heading styles the
// original hardcoded markup had.

// "First sentence. Second sentence." -> ["First sentence.", "Second sentence."],
// split on the first ". " boundary. Falls back to [text, null] when there's no second
// sentence. Used by headings that accent only the trailing sentence (Home's
// capabilities heading, FAQ's heading).
function splitFirstSentence(text) {
  const idx = text.indexOf(". ");
  if (idx === -1) return [text, null];
  return [text.slice(0, idx + 1), text.slice(idx + 2)];
}

// "word word LAST" -> ["word word", "LAST"], split on the final space. Used by
// headings that accent only the last word (Contact's heading).
function splitLastWord(text) {
  const idx = text.lastIndexOf(" ");
  if (idx === -1) return ["", text];
  return [text.slice(0, idx), text.slice(idx + 1)];
}

module.exports = { splitFirstSentence, splitLastWord };
