# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Next.js 16 (App Router, TypeScript, Tailwind v4) app for the Kargatox marketing site + admin panel,
scaffolded at the repo root, living alongside the original **design handoff** reference material
(`design_handoff_kargatox/`, the root `.dc.html` prototypes, `uploads/`). The handoff files are not code
to copy from — they're the spec the app is being built against. See "Design reference material" below.

Steps 1–2 of the handoff's suggested build order are done: scaffold + tokens + fonts, plus the shared
header/footer, the `Reveal`/`RevealGroup`/`RiseWords`/`GrowBar` animation primitives, and all five public
pages (Home, Services, How we work, FAQ, Contact) with static content and their client-side-only
interactions (revenue-check quiz, FAQ accordion, Contact form validation + URL prefill). Nothing submits
to a backend yet — no API routes, no database, no auth, no admin panel. See "Suggested build order" below
for what's next (step 3: the Contact form's `/api/enquiries` route).

## Commands

- `npm run dev` — start the dev server (Turbopack) at `http://localhost:3000`.
- `npm run build` — production build (also type-checks; fails the build on TS errors).
- `npm start` — serve the production build (`build` must run first).
- `npm run lint` — ESLint (`eslint-config-next`).
- No test suite exists yet.

## Architecture

- App Router only, under `src/app/`. `src/app/layout.tsx` loads fonts and sets global `<html>`/`<body>`
  classes; `src/app/globals.css` holds the Tailwind v4 theme.
- **Tailwind v4 is CSS-first here — there is no `tailwind.config.js`.** All design tokens live in the
  `@theme inline { ... }` block in `src/app/globals.css`, sourced from
  `design_handoff_kargatox/README.md`'s Design tokens section:
  - Brand colours (`navy-900/800/700`, `orange-500/400`, `blue-500/600/700/300`, `paper`, `ink`, `slate`,
    `mist`/`mist-2`, `line`/`line-2`, `chip-neutral`/`chip-cool`/`chip-blue`, `success`/`success-dark`).
  - Enquiry status colours (`status-new/contacted/proposal/won/lost`) for the admin pipeline.
  - Admin light/dark theme (`admin-bg/panel/panel-2/border/text/muted/soft`) — these are plain CSS custom
    properties on `:root` and `[data-theme="dark"]` (not `prefers-color-scheme`: the admin theme is a
    user-toggled preference per the README, saved per user, not OS-driven), re-exposed as Tailwind colours
    via `@theme inline` so `bg-admin-panel`, `text-admin-text`, etc. work and repaint when `data-theme` is
    set on `<html>`. The public marketing site doesn't use this — it's navy/paper by design, not
    light/dark adaptive.
  - `--font-display` / `--font-body` / `--font-mono`, and `--width-site: 1240px` (the README's container
    max-width), `--radius-chip/input/card/panel/pill` (midpoints of the README's stated ranges).
  - When adding a token, add it to this `@theme inline` block, matching the README's naming/hex values
    exactly — don't invent new colours or radii.
- **Fonts:** the README specifies Fontshare's Clash Display (display) + Satoshi (body) + Google's
  JetBrains Mono. Clash Display/Satoshi aren't on Google Fonts and need self-hosting via `next/font/local`
  with real font files, which this repo doesn't have yet. `src/app/layout.tsx` currently loads **Bricolage
  Grotesque + Figtree** via `next/font/google` as a stand-in — this is one of the README's own "tested"
  alternative pairs (it's what the root `Kargatox Website.dc.html` prototype actually uses), not an
  improvisation. Swap in real Clash Display/Satoshi files via `next/font/local` before this ships; don't
  just rename the Google Fonts to make the diff look done.
- No backend/database/auth exists yet (Prisma, Auth.js, API routes) — see the data model and route list in
  `design_handoff_kargatox/README.md` when building those.
- **Route structure:** `src/app/page.tsx` (Home), `src/app/services/`, `src/app/how-we-work/`,
  `src/app/faq/`, `src/app/contact/` — matching the README's suggested routes. `SiteHeader` renders once
  in the root layout (persists across client-side navigation); `SiteFooter` is rendered explicitly at the
  bottom of each page (not the layout) because its `showCta` prop varies per page (`false` only on
  Contact) and Next.js layouts can't take per-page props.
- **Animation primitives** live in `src/components/motion/reveal.tsx`: `Reveal` (single-element scroll
  reveal), `RevealGroup` (stagger container, `(index % 6) * 90ms` delay matching the README), `RiseWords`
  (hero heading words — mount-triggered via `animate`, **not** `whileInView`: these are always in view on
  load, and gating them on intersection was a real bug caught during review, so don't "fix" it back),
  `GrowBar` (bar/fill grow-in). `src/components/motion/provider.tsx` wraps the app in
  `MotionConfig reducedMotion="user"`, which is what satisfies the reduced-motion requirement — don't
  re-add manual `prefers-reduced-motion` checks in components that already sit under it.
- Client components that need `useSearchParams()` (e.g. `src/app/contact/contact-form.tsx`) must be
  wrapped in `<Suspense>` by their parent page — Next.js requires this for static generation to succeed.
- `eslint-plugin-react-hooks`'s `set-state-in-effect` rule is enabled and treated as a real error here, not
  noise — see `SiteHeader`'s pathname-reset and `ContactForm`'s URL-prefill for the pattern used instead
  (derive/reset during render, or a lazy `useState(() => ...)` initializer, rather than `setState` inside
  `useEffect`).

## Design reference material

- `design_handoff_kargatox/README.md` — the full spec: design tokens, per-screen behaviour,
  interactions/animations, responsiveness rules, a Prisma data-model sketch, and a suggested build order.
  **Read this file before doing any implementation work** — it is far more detailed than the summary above.
- `design_handoff_kargatox/content/Website-content.pdf` — the client's source copy. Site copy must be taken
  from it **word for word**.
- `design_handoff_kargatox/designs/*.dc.html` — the prototype screens (see below).

The `.dc.html`/`support.js` files at the repo root are duplicates of `design_handoff_kargatox/designs/`
(kept for convenience so the prototypes can be opened directly). `uploads/` holds copies of the source
PDF and a pasted screenshot; not authoritative. `Kargatox Website.dc.html` (root only) is an earlier
single-page-scroll concept (one page with `#capabilities`/`#services`/`#process`/`#faq`/`#contact`
anchors) — it predates and is superseded by the multi-page structure in `designs/`; don't treat it as a
spec, though its font `<link>` is the source for the Bricolage Grotesque + Figtree stand-in above.

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

- Next.js 14+ (App Router) + TypeScript + Tailwind CSS, deployed on Vercel — scaffolded here with Next.js
  16 / React 19 / Tailwind v4 (`npx create-next-app@latest` ran with `--typescript --tailwind --eslint --app
  --src-dir`, no version pinned, so re-scaffolding today would land on whatever's current).
- PostgreSQL (Supabase or Neon) with Prisma. **Not set up yet.**
- Auth.js (NextAuth), email magic links, role-based access control (OWNER/ADMIN/EDITOR/SALES). **Not set up
  yet.**
- Resend (or SMTP) for enquiry notifications, auto-replies, and admin replies. **Not set up yet.**
- Framer Motion for animation — set up (`src/components/motion/`); decorative infinite loops (background
  orbs, the sub-service marquee) use plain CSS keyframes in `globals.css` instead, not Framer Motion.
- Page copy, services, FAQ and posts live in the database, edited via the admin panel, read by public
  pages at build time with ISR revalidation on publish.

Suggested routes, the Prisma data-model sketch, and the 9-step build order are in
`design_handoff_kargatox/README.md` — follow that order (scaffold → public pages → contact API → revenue
check → Prisma/auth/admin shell → enquiries/revenue-checks/dashboard → pages/content/posts → team/settings
→ SEO/analytics/a11y) rather than re-deriving a sequence. **Steps 1–2 are done (scaffold + tokens + fonts;
header, footer, animation primitives, and the five public pages with static content). Step 3 is next:
Contact form API route (`/api/enquiries`), zod validation, database write, emails, spam protection —
`src/app/contact/contact-form.tsx`'s `submit()` currently just sets `sent` state locally with a `TODO`
comment where the POST call goes.**

## Key constraints to preserve when rebuilding

- Site copy comes from `design_handoff_kargatox/content/Website-content.pdf` verbatim — don't paraphrase.
- The prototype **data** (dashboard numbers, sample enquiries, team names, "SAMPLE DATA" panels on
  Services) is placeholder and must not be treated as real content.
- Role permissions (Owner/Admin/Editor/Sales, described in the README's Team section) must be enforced
  server-side, not just hidden in the UI.
- Animations must respect `prefers-reduced-motion: reduce` (all easing is `cubic-bezier(.2,.7,.1,1)` per
  the README).
