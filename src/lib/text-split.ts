// Small helpers that let an admin-editable plain-text field reproduce the
// two-tone heading styles the original hardcoded JSX had, without a rich
// editor. Each public page component decides which rule applies to which
// field — see src/app/(site)/page.tsx, .../faq/page.tsx, .../contact/page.tsx.

// "First sentence. Second sentence." -> ["First sentence.", "Second sentence."],
// split on the first ". " boundary. Falls back to [text, null] when there's
// no second sentence. Used by headings that accent only the trailing
// sentence (Home's capabilities heading, FAQ's heading — both blue-600).
export function splitFirstSentence(text: string): [string, string | null] {
  const idx = text.indexOf(". ");
  if (idx === -1) return [text, null];
  return [text.slice(0, idx + 1), text.slice(idx + 2)];
}

// "word word LAST" -> ["word word", "LAST"], split on the final space. Used
// by headings that accent only the last word (Contact's heading, blue-300).
export function splitLastWord(text: string): [string, string] {
  const idx = text.lastIndexOf(" ");
  if (idx === -1) return ["", text];
  return [text.slice(0, idx), text.slice(idx + 1)];
}
