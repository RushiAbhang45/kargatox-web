# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Next.js 16 (App Router, TypeScript, Tailwind v4) app for the Kargatox marketing site + admin panel,
scaffolded at the repo root, living alongside the original **design handoff** reference material
(`design_handoff_kargatox/`, the root `.dc.html` prototypes, `uploads/`). The handoff files are not code
to copy from — they're the spec the app is being built against. See "Design reference material" below.

Steps 1–5 of the handoff's suggested build order are done, and step 6 is mostly done: scaffold + tokens +
fonts; the shared
header/footer, the `Reveal`/`RevealGroup`/`RiseWords`/`GrowBar` animation primitives, and all five public
pages (Home, Services, How we work, FAQ, Contact) with static content and their client-side-only
interactions (revenue-check quiz, FAQ accordion); the Contact form submits for real to `POST /api/enquiries`,
which validates with zod, rate-limits, checks a honeypot, and writes to a Postgres database via Prisma (see
"Backend: the enquiries API" below); the revenue-check quiz now posts each completed check to
`POST /api/revenue-checks` and links it to the resulting `Enquiry` when the visitor submits one (see
"Backend: the revenue-check API" below); and Auth.js (magic-link) + a role-gated admin panel exist, with a
working Enquiries pipeline (status changes, assignment, replies, CSV export) and a real-data Dashboard (see
"Auth and the admin panel" below). Email notifications (both the enquiry auto-reply and admin replies sent
from the Enquiries panel) are still `console.log` stubs, not real Resend/SMTP delivery. The admin
Revenue-checks page is still a placeholder — the data is now being collected, but the stats/table view to
show it (step 6's remaining piece) hasn't been built. Pages, Services & FAQ, Blog, Team and Settings (steps
7–8) are also placeholders in the admin nav — see "Suggested build order" below for what's next.

## Commands

- `npm run dev` — start the dev server (Turbopack) at `http://localhost:3000`.
- `npm run build` — production build (also type-checks; fails the build on TS errors). `postinstall` runs
  `prisma generate`, so a fresh `npm install` regenerates the Prisma client automatically.
- `npm start` — serve the production build (`build` must run first).
- `npm run lint` — ESLint (`eslint-config-next`).
- `npm run db:seed` — runs `prisma/seed.js`, which upserts a single `User` as `OWNER` (email from
  `SEED_OWNER_EMAIL`, defaulting to `punedeveloper@mipl.co.in`). **Run this before logging into `/admin`
  for the first time** — there's no self-serve signup (see "Auth and the admin panel" below), so without a
  seeded row the magic-link flow has no account to sign in to.
- `npx prisma migrate dev` — create/apply a migration from `prisma/schema.prisma` and generate the client.
  Run this after any further `schema.prisma` edits (it creates a new timestamped folder under
  `prisma/migrations/`).
- `npx prisma studio` — browse the Postgres tables (`Enquiry`, `EnquiryMessage`, `User`, etc).
- Needs a `.env` with `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `AUTH_SECRET` (copy `.env.example`, which
  documents the shape of each and how to generate a secret) — gitignored, not committed. Local dev and
  production currently point at the **same** Neon database (there's no separate dev/prod split yet — fine
  pre-launch with no real customer data, but worth splitting via a Neon branch before that changes).
- No test suite exists yet.

## Architecture

- App Router only, under `src/app/`. `src/app/layout.tsx` is the root layout: it loads fonts, sets global
  `<html>`/`<body>` classes, and wraps everything in `MotionProvider` — nothing else (no header/nav), since
  the admin panel must not inherit the public site chrome. `src/app/globals.css` holds the Tailwind v4
  theme.
- **Route groups split public site from admin:** `src/app/(site)/` holds the five public pages plus its own
  `layout.tsx` (renders `SiteHeader` once, persisting across client-side nav within the group);
  `src/app/admin/` holds the admin panel and is a sibling of `(site)`, not nested inside it, so it never
  picks up `SiteHeader`/`SiteFooter`. `SiteFooter` is still rendered explicitly at the bottom of each public
  page (not the `(site)` layout) because its `showCta` prop varies per page (`false` only on Contact) and
  Next.js layouts can't take per-page props.
- **Tailwind v4 is CSS-first here — there is no `tailwind.config.js`.** All design tokens live in the
  `@theme inline { ... }` block in `src/app/globals.css`, sourced from
  `design_handoff_kargatox/README.md`'s Design tokens section:
  - Brand colours (`navy-900/800/700`, `orange-500/400`, `blue-500/600/700/300`, `paper`, `ink`, `slate`,
    `mist`/`mist-2`, `line`/`line-2`, `chip-neutral`/`chip-cool`/`chip-blue`, `success`/`success-dark`).
  - Enquiry status colours (`status-new/contacted/proposal/won/lost`) for the admin pipeline.
  - Admin light/dark theme (`admin-bg/panel/panel-2/border/text/muted/soft`) — these are plain CSS custom
    properties on `:root` and `[data-theme="dark"]` (not `prefers-color-scheme`: the admin theme is a
    user-toggled preference saved to `localStorage` by `src/components/admin/theme-toggle.tsx`, not
    OS-driven), re-exposed as Tailwind colours via `@theme inline` so `bg-admin-panel`, `text-admin-text`,
    etc. work and repaint when `data-theme` is set on `<html>`. The public marketing site doesn't use this
    — it's navy/paper by design, not light/dark adaptive.
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
- **Animation primitives** live in `src/components/motion/reveal.tsx`: `Reveal` (single-element scroll
  reveal), `RevealGroup` (stagger container, `(index % 6) * 90ms` delay matching the README), `RiseWords`
  (hero heading words — mount-triggered via `animate`, **not** `whileInView`: these are always in view on
  load, and gating them on intersection was a real bug caught during review, so don't "fix" it back),
  `GrowBar` (bar/fill grow-in). `src/components/motion/provider.tsx` wraps the app in
  `MotionConfig reducedMotion="user"`, which is what satisfies the reduced-motion requirement — don't
  re-add manual `prefers-reduced-motion` checks in components that already sit under it.
- Client components that need `useSearchParams()` (e.g. `src/app/(site)/contact/contact-form.tsx`) must be
  wrapped in `<Suspense>` by their parent page — Next.js requires this for static generation to succeed.
- `eslint-plugin-react-hooks`'s `set-state-in-effect` rule is enabled and treated as a real error here, not
  noise — see `SiteHeader`'s pathname-reset and `ContactForm`'s URL-prefill for the pattern used instead
  (derive/reset during render, or a lazy `useState(() => ...)` initializer, rather than `setState` inside
  `useEffect`).

## Backend: the enquiries API

`POST /api/enquiries` (`src/app/api/enquiries/route.ts`) backs both the Contact form
(`src/app/(site)/contact/contact-form.tsx`) and the revenue-check quiz — the two are distinguished by a
`source: "Contact form" | "Revenue check"` field (`src/lib/enquiry-schema.ts`); the Contact form derives
this from whether a `checkId` query param is present or its prefilled `details` textarea starts with the
`"Revenue check result:"` marker (both set by the quiz's CTA redirect — see "Backend: the revenue-check
API" below). When `checkId` is present, the created `Enquiry` is linked to that `RevenueCheck` row via
`revenueCheckId`.

- **`src/lib/enquiry-schema.ts`** — the zod `enquirySchema` and `SERVICE_OPTIONS` are shared between the
  client form (drives the `<select>` options and the honeypot field name) and the API route's
  `safeParse`. Add new services/sources here, not in the component.
- **`src/lib/prisma.ts`** — the standard Next.js dev-mode Prisma singleton (caches the client on
  `globalThis` so hot reload doesn't open a new connection per edit). Import `prisma` from here, never
  `new PrismaClient()` directly.
- **`prisma/schema.prisma`** — Postgres (Neon), with `url` set to the pooled (pgbouncer) connection and
  `directUrl` to the unpooled one Prisma needs for migrations (`DATABASE_URL` / `DATABASE_URL_UNPOOLED` —
  Neon's own naming, used as-is rather than renamed). Models: `Enquiry` (with `ownerId`/`owner` for
  assignment, a `messages` relation to `EnquiryMessage` — the admin reply log, incoming replies aren't
  handled, every row is outbound — and `revenueCheckId`/`revenueCheck`, a relation to `RevenueCheck`),
  `RevenueCheck` itself (see "Backend: the revenue-check API" below), plus `User`/`Account`/`Session`/
  `VerificationToken` for the Auth.js Prisma adapter. `status`/`source`/`role` are plain strings validated
  at the API/action boundary rather than native Prisma `enum`s — that was originally a SQLite limitation
  (no enum support), kept as-is after the Postgres move since nothing requires changing it.
- **`src/lib/rate-limit.ts`** — in-memory, per-process token bucket keyed by IP (`x-forwarded-for` /
  `x-real-ip`). Fine for local dev or a single instance; a multi-instance deploy needs a shared store
  (e.g. Upstash Redis) or every instance tracks its own counts independently.
- **Spam protection:** a visually-hidden, `tabIndex={-1}` honeypot `company` field — the API silently
  returns `201 { ok: true }` without saving or emailing if it's filled, rather than erroring (don't tip off
  bots).
- **`src/lib/email.ts`** — `sendEnquiryEmails()` is currently a `console.log` stub, not Resend/SMTP (the
  admin reply action and the Auth.js magic-link sender use the same stub pattern — see below). The README
  calls for an admin notification plus an optional customer auto-reply; wire that up when an email
  provider/API key is available. Enquiries save to the DB either way, so the stub doesn't block the rest of
  the flow.
- `prisma`/`@prisma/client` are pinned to `6.19.3` (devDependency/dependency respectively), not `^latest`.
  **Prisma 7 removed `datasource { url = env(...) }` from `schema.prisma`** (it now requires a
  `prisma.config.ts` + driver adapter passed into `new PrismaClient({ adapter })`) — `npm view prisma
  version` currently resolves to a `8.0.0-rc.19` "latest" tag, so an unpinned `npm install prisma@latest`
  will pull that breaking change and fail `prisma validate` against the schema as written. Bump the pin
  deliberately (and migrate `src/lib/prisma.ts`/`schema.prisma` to the new config style) rather than
  letting a routine dependency update do it silently.

## Backend: the revenue-check API

`POST /api/revenue-checks` (`src/app/api/revenue-checks/route.ts`) is public, rate-limited the same way as
`/api/enquiries`, and backs the Home page's quiz (`src/components/home/revenue-check.tsx`).

- **`src/lib/revenue-check-schema.ts`** — the zod `revenueCheckSchema` validating
  `{leads, sales, retention, weakest, sessionId, email?, city?}` per the README's sketch. `email`/`city`
  are accepted but never populated by the quiz today (it's anonymous) — they're there for a future
  identified-visitor flow.
- **The quiz component** generates a per-browser-session id once (`createSessionId()`, a
  `crypto.randomUUID()` fallback since that global isn't guaranteed on every Node version during SSR) and
  POSTs when the third answer is given, guarded by a ref keyed on the answer signature so React's dev-mode
  double-invoke (or any re-render) doesn't double-submit; a Retake clears the guard so a second completed
  attempt posts again as its own row. The returned `id` is appended to the result CTA's href as `checkId`
  so `/api/enquiries` can link the two if the visitor goes on to submit the Contact form. The POST is
  fire-and-forget — a failed request doesn't block the result screen from rendering, it just means no
  `checkId` gets appended to the CTA.
- **Linking is server-verified, not trusted from the client:** `/api/enquiries` looks up the incoming
  `revenueCheckId` with `prisma.revenueCheck.findUnique` before using it — an invalid or stale id is
  silently dropped (sets `null`) rather than failing the whole enquiry submission.
- The admin **Revenue checks** page (`/admin/revenue-checks`) is still a `<ComingSoon>` placeholder — the
  README's stats/table view for this data is part of step 6 and hasn't been built yet, even though the data
  is now being collected.

## Auth and the admin panel

Auth.js v5 (`next-auth@5.0.0-beta.32`) with the Prisma adapter and **email magic links only** — no
OAuth providers, no password login.

- **`src/auth.ts`** — `NextAuth({ ... })` exports `handlers`/`auth`/`signIn`/`signOut`. Session strategy is
  `"database"` (sessions live in the `Session` table, not JWT). The `Nodemailer` provider's
  `sendVerificationRequest` is overridden to `console.log` the magic link instead of sending real mail — the
  `server: "smtp://localhost:1025"` value is a required-but-unused dummy (the provider factory throws at
  startup without *some* value, but the override never reads it).
- **No self-serve signup.** The `signIn` callback rejects any email that doesn't already have a `User` row
  — without it, Auth.js's adapter would silently create a new `SALES`-role account for anyone who completes
  the magic-link flow. The only way to create a `User` right now is `npm run db:seed` (or inserting a row
  directly) — there's no team-invite UI yet (that's step 8). The `session` callback then copies `id`/`role`
  from the `User` row onto `session.user`.
- **`src/types/next-auth.d.ts`** — module augmentation so `session.user` is typed with `id`/`role` (a
  `Role` from `src/lib/roles.ts`) and non-nullable `email` (safe because the `signIn` callback above
  guarantees an existing, email-bearing `User`).
- **`src/lib/roles.ts`** — `ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"]` and permission helpers like
  `canAccessEnquiries()` (Owner/Admin/Sales, per the README's Team section — Editor gets pages/services/
  FAQ/blog instead). Add new permission checks here, not inline in routes/components.
- **Route protection has no `middleware.ts`** — it's done at the layout level.
  `src/app/admin/(protected)/layout.tsx` calls `auth()` server-side and `redirect("/admin/login")` if
  there's no session; everything under that route group (dashboard, enquiries, etc.) inherits the check.
  `src/app/admin/login/` (the login page, the `verify` "check your email" page, and the
  `requestMagicLink` server action) lives *outside* `(protected)` so it's reachable when signed out.
- **Server actions re-check permissions themselves**, not just the UI — e.g.
  `src/app/admin/(protected)/enquiries/actions.ts`'s `requireEnquiryAccess()` calls `auth()` and
  `canAccessEnquiries()` at the top of every mutation (`updateEnquiryStatus`, `assignEnquiry`,
  `sendReply`). This is the pattern to copy for any new mutation — see "Key constraints" below.
- **Admin nav (`src/lib/admin-nav.ts`)** lists the full README-spec sidebar (Dashboard, Enquiries, Revenue
  checks, Pages, Services & FAQ, Blog & case studies, Team, Settings), but only Dashboard
  (`src/app/admin/(protected)/page.tsx`) and Enquiries are real — the rest render the shared
  `<ComingSoon>` component (`src/components/admin/coming-soon.tsx`) rather than 404ing, so the nav can show
  the full intended layout before every section is built.
- **Enquiries** (`src/app/admin/(protected)/enquiries/`): `page.tsx` is a server component that loads
  enquiries + team members and hands them to the client `EnquiriesView` (`src/components/admin/
  enquiries-view.tsx`) for filtering, a detail panel, reply templates, and status/assignment controls, all
  backed by the server actions above. `GET /api/admin/enquiries/export` streams the same data as CSV
  (role-gated the same way, respects an optional `?status=` filter).
- **Dashboard** (`src/app/admin/(protected)/page.tsx`) runs real Prisma queries (total count, last-30-days
  count, a 12-week bucketed chart, latest 4 enquiries) — no fake numbers. The README's GA-backed widgets
  (traffic sources, visitors, top pages) are deferred to step 9 (analytics), not stubbed with placeholder
  data.

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
  --src-dir`, no version pinned, so re-scaffolding today would land on whatever's current). **Deployed**:
  GitHub repo `RushiAbhang45/kargatox-web` (`main` branch), imported into Vercel as project `kargatox-web`,
  auto-deploying on push.
- PostgreSQL (Supabase or Neon) with Prisma. **Set up** — a Neon database was provisioned through Vercel's
  Storage tab and connected to the Production + Preview environments (not Development; local dev points at
  the same database directly via `.env`, not via Vercel env). `package.json`'s `vercel-build` script
  (`prisma migrate deploy && next build`) applies any pending migrations on every deploy — Vercel detects
  and runs this script instead of the default `build` automatically because of its name.
- Auth.js (NextAuth), email magic links, role-based access control (OWNER/ADMIN/EDITOR/SALES). **Set up**
  (see "Auth and the admin panel" above) — magic links currently log to the console instead of sending real
  mail, and there's no team-invite flow yet (step 8), so new users can only be added via `npm run db:seed`
  or a direct DB insert.
- Resend (or SMTP) for enquiry notifications, auto-replies, and admin replies. **Not set up yet** — stubbed
  as `console.log`s in `src/lib/email.ts`, the Enquiries reply action, and the Auth.js magic-link sender.
- Framer Motion for animation — set up (`src/components/motion/`); decorative infinite loops (background
  orbs, the sub-service marquee) use plain CSS keyframes in `globals.css` instead, not Framer Motion.
- Page copy, services, FAQ and posts live in the database, edited via the admin panel, read by public
  pages at build time with ISR revalidation on publish. **Not done yet** — Services/FAQ/Blog/Pages content
  is still hardcoded in the public pages/`src/app/(site)/services/data.ts`; their admin pages are
  `<ComingSoon>` placeholders (step 7).

Suggested routes, the Prisma data-model sketch, and the 9-step build order are in
`design_handoff_kargatox/README.md` — follow that order (scaffold → public pages → contact API → revenue
check → Prisma/auth/admin shell → enquiries/revenue-checks/dashboard → pages/content/posts → team/settings
→ SEO/analytics/a11y) rather than re-deriving a sequence. **Steps 1–5 are done; step 6 is partly done**
(Enquiries and Dashboard are real, but the Revenue-checks admin stats/table view hasn't been built — see
"Backend: the revenue-check API" above). **Next up:** that Revenue-checks admin page, then step 7
(Pages/Services & FAQ/Blog content moving into the DB and the admin panel) and step 8 (Team management —
the invite flow that would replace `db:seed`, Settings), followed by step 9 (SEO/analytics/a11y).

## Key constraints to preserve when rebuilding

- Site copy comes from `design_handoff_kargatox/content/Website-content.pdf` verbatim — don't paraphrase.
- The prototype **data** (dashboard numbers, sample enquiries, team names, "SAMPLE DATA" panels on
  Services) is placeholder and must not be treated as real content.
- Role permissions (Owner/Admin/Editor/Sales, described in the README's Team section) must be enforced
  server-side, not just hidden in the UI — see `requireEnquiryAccess()` in
  `src/app/admin/(protected)/enquiries/actions.ts` for the pattern every new mutation/route should follow.
- Animations must respect `prefers-reduced-motion: reduce` (all easing is `cubic-bezier(.2,.7,.1,1)` per
  the README).
