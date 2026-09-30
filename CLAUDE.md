# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **design handoff**, not a codebase. No application exists yet — there is no `package.json`,
build tool, linter, or test suite, and nothing to run `npm install`/`build`/`test` against. The repo
contains high-fidelity HTML/CSS/JS **prototypes** for the Kargatox marketing site and admin panel, meant
to be rebuilt from scratch in a real stack (see "Recommended stack" below).

The authoritative handoff lives in `design_handoff_kargatox/`:
- `design_handoff_kargatox/README.md` — the full spec: design tokens, per-screen behaviour, interactions/animations, responsiveness rules, a Prisma data-model sketch, and a suggested build order. **Read this file before doing any implementation work** — it is far more detailed than the summary below.
- `design_handoff_kargatox/content/Website-content.pdf` — the client's source copy. Site copy must be taken from it **word for word**.
- `design_handoff_kargatox/designs/*.dc.html` — the prototype screens (see below).

The `.dc.html`/`support.js` files at the repo root are duplicates of `design_handoff_kargatox/designs/`
(kept for convenience so the prototypes can be opened directly). `uploads/` holds copies of the source
PDF and a pasted screenshot; not authoritative. `Kargatox Website.dc.html` (root only) is an earlier
single-page-scroll concept (one page with `#capabilities`/`#services`/`#process`/`#faq`/`#contact`
anchors) — it predates and is superseded by the multi-page structure in `designs/`; don't treat it as a
spec.

## Working with the `.dc.html` prototype files

These are **Divhunt-style component prototypes**, not plain HTML — do not hand-edit them expecting normal
templating, and do not copy their markup verbatim into production code. Each file is a design reference:
rebuild the behaviour it shows using the target stack's normal patterns.

- To view one, open it directly in a browser. `support.js` must sit in the same folder — it's a generated
  runtime (see its header comment: `GENERATED from dc-runtime/src/*.ts`) that parses the `<x-dc>` template
  and renders it with React/ReactDOM loaded from the page.
- Structure of each file: an `<x-dc>` block holding the template markup (inline styles, `sc-*` directives),
  followed by `<script type="text/x-dc" data-dc-script data-props="...">` containing `class Component extends DCLogic { ... }` with the component's logic and sample/placeholder data. **Read both** the template and the script — the script is where interactive behaviour (accordions, form validation, the revenue-check quiz, animations wiring) and sample data arrays live.
- Directives you'll see in the templates: `sc-for` (list loops, e.g. `<sc-for list="{{ pillars }}" as="p">`), `sc-if`/`sc-else` (conditionals), `sc-interp` (`{{ expr }}` interpolation), `style-hover="..."` (hover-state styles inline), `data-screen-label="..."` (marks a section for the design tool's outline view), `data-float`/`data-grow`/`data-stagger` (hooks for the scroll/hover animation engine described in the README's Animations section).
- Colours, spacing, type, radii, shadows and logo construction are pixel-final per the README's Design
  tokens section — don't improvise new values when translating a screen.

## Recommended stack for the real build (from the handoff README)

- Next.js 14+ (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- PostgreSQL (Supabase or Neon) with Prisma.
- Auth.js (NextAuth), email magic links, role-based access control (OWNER/ADMIN/EDITOR/SALES).
- Resend (or SMTP) for enquiry notifications, auto-replies, and admin replies.
- Framer Motion for animation (or keep the plain Web Animations API approach from the prototype).
- Page copy, services, FAQ and posts live in the database, edited via the admin panel, read by public
  pages at build time with ISR revalidation on publish.

Suggested routes, the Prisma data-model sketch, and the 9-step build order are in
`design_handoff_kargatox/README.md` — follow that order (scaffold → public pages → contact API → revenue
check → Prisma/auth/admin shell → enquiries/revenue-checks/dashboard → pages/content/posts → team/settings
→ SEO/analytics/a11y) rather than re-deriving a sequence.

## Key constraints to preserve when rebuilding

- Site copy comes from `design_handoff_kargatox/content/Website-content.pdf` verbatim — don't paraphrase.
- The prototype **data** (dashboard numbers, sample enquiries, team names, "SAMPLE DATA" panels on
  Services) is placeholder and must not be treated as real content.
- Role permissions (Owner/Admin/Editor/Sales, described in the README's Team section) must be enforced
  server-side, not just hidden in the UI.
- Animations must respect `prefers-reduced-motion: reduce` (all easing is `cubic-bezier(.2,.7,.1,1)` per
  the README).
