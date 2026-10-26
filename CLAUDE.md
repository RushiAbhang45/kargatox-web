# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Next.js 16 (App Router, TypeScript, Tailwind v4) app for the Kargatox marketing site + admin panel,
scaffolded at the repo root, living alongside the original **design handoff** reference material
(`design_handoff_kargatox/`, the root `.dc.html` prototypes, `uploads/`). The handoff files are not code
to copy from — they're the spec the app is being built against. See "Design reference material" below.

Steps 1–6 of the handoff's suggested build order are done: scaffold + tokens + fonts; the shared
header/footer, the `Reveal`/`RevealGroup`/`RiseWords`/`GrowBar` animation primitives, and all five public
pages (Home, Services, How we work, FAQ, Contact) with static content and their client-side-only
interactions (revenue-check quiz, FAQ accordion); the Contact form submits for real to `POST /api/enquiries`,
which validates with zod, rate-limits, checks a honeypot, and writes to a Postgres database via Prisma (see
"Backend: the enquiries API" below); the revenue-check quiz now posts each completed check to
`POST /api/revenue-checks` and links it to the resulting `Enquiry` when the visitor submits one (see
"Backend: the revenue-check API" below); and Auth.js (database sessions, password-only sign-in — magic
link was removed) + a role-gated, mobile-responsive admin panel exist, with a working Enquiries pipeline
(status changes, assignment, replies, CSV export) and a real-data Dashboard (see "Auth and the admin panel"
below). Step 6 is now complete: the admin **Revenue-checks** page has a real stats/table view over the
collected data, and email delivery (the enquiry auto-reply/notification, admin replies sent from the
Enquiries panel) goes out over real SMTP via `src/lib/mailer.ts` when `SMTP_*` env vars are set, falling
back to a `console.log` stub otherwise (see "Backend: the enquiries API" below). Step 8's **Team** section
(invite-by-email, replacing `db:seed`/`admin:set-password` as the way to add teammates) is also done now —
see "Auth and the admin panel" below. **Steps 7 and 8 are now both complete**: Pages (draft/publish text
editing for the five public pages), Services & FAQ (editable sub-service and FAQ rows), Blog & case studies
(a `Post` model, Tiptap-based editor, and public `/blog`/`/blog/[slug]` routes), and Settings (general
enquiry-email settings plus a Google Analytics toggle) are all real now — see "Backend: content admin
(Pages, Services & FAQ, Blog, Settings)" below. Nothing in the admin nav renders `<ComingSoon>` anymore (that
component was deleted as dead code). **Only step 9 (SEO/analytics/a11y) remains** — GA is wired in as part
of Settings, but sitemap/robots/structured-data/Lighthouse work is still open.

Separately, the current branch (`redesign/schbang-direction`) carries an **experimental visual reskin** of
the five public pages on top of all of the above — black/white/orange instead of navy/blue, GSAP-driven
scroll effects alongside the existing Framer Motion primitives. It has not been merged to `main`. See
"Public-site visual redesign (`redesign/schbang-direction` branch)" below for what it touches and, just as
importantly, what it deliberately leaves on the old theme.

## Commands

- `npm run dev` — start the dev server (Turbopack) at `http://localhost:3000`.
- `npm run build` — production build (also type-checks; fails the build on TS errors). `postinstall` runs
  `prisma generate`, so a fresh `npm install` regenerates the Prisma client automatically.
- `npm start` — serve the production build (`build` must run first).
- `npm run lint` — ESLint (`eslint-config-next`).
- `npm run db:seed` — runs `prisma/seed.js`, which upserts a single `User` as `OWNER` (email from
  `SEED_OWNER_EMAIL`, defaulting to `punedeveloper@mipl.co.in`). **Pass `SEED_OWNER_PASSWORD` too** — sign-in
  is password-only (see "Auth and the admin panel" below), so a seeded row with no password can't sign in at
  all; the script warns if you forget it.
- `npm run admin:set-password -- <email> <password> [role]` — runs `prisma/set-password.js` to create or
  reset any admin account's password (bcrypt-hashes it, upserts the `User` row; `role` defaults to `OWNER`
  for a brand-new user and is left unchanged for an existing one unless passed). Mainly useful for the
  first Owner account or resetting a lost password — every other user should go through the `/admin/team`
  invite flow instead (see "Auth and the admin panel" below).
- `npx prisma migrate dev` — create/apply a migration from `prisma/schema.prisma` and generate the client.
  Run this after any further `schema.prisma` edits (it creates a new timestamped folder under
  `prisma/migrations/`).
- `npx prisma studio` — browse the Postgres tables (`Enquiry`, `EnquiryMessage`, `User`, etc).
- Needs a `.env` with `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `AUTH_SECRET` (copy `.env.example`, which
  documents the shape of each and how to generate a secret) — gitignored, not committed. Local dev and
  production currently point at the **same** Neon database (there's no separate dev/prod split yet — fine
  pre-launch with no real customer data, but worth splitting via a Neon branch before that changes).
  `.env.example` also documents optional `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM`/
  `ADMIN_NOTIFY_EMAIL` — omit all of them and email sending falls back to a `console.log` stub (see
  `src/lib/mailer.ts` below).
- No test suite exists yet.

## Architecture

- **Next.js 16 / React 19 may differ from older training data.** `AGENTS.md` at the repo root is
  auto-written by `next dev` itself (it gets silently re-added if deleted — committing it is expected, not
  a stray diff) and says to check `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`,
  `04-community/`) before writing App Router code, since APIs/conventions may have changed. Consult those
  docs for anything beyond the patterns already established elsewhere in this repo.
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
- **Logo:** the client-supplied `src/Images/Kargatox KnowledgePartners Full logo.ico` is wired in as
  `src/app/favicon.ico` (copied over, not referenced in place — same "drop location vs. build artifact"
  split as `design_handoff_kargatox`'s `uploads/`). The sibling `.webp` is **not** used anywhere yet:
  `src/components/logo.tsx` still renders the CSS-only placeholder mark (two overlapping squares +
  "Kargatox" wordmark), because every current call site (`SiteHeader`, admin login, admin sidebar, the
  Team accept-invite page) sits on a navy background, and the `.webp` is 3300×2550 with an **opaque white
  background and no alpha channel** — dropped in as-is on navy it renders as a white rectangle. Don't wire
  it into any of those spots without either cropping/keying it to transparency first or getting a
  transparent-background export from the client; it's fine to use once a white/light-background spot
  exists for it. (On the `redesign/schbang-direction` branch, `Logo` gained a `variant?: "dark" | "light"`
  prop for exactly this reason — see below — but the `.webp` question above is unaffected either way.)
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

## Public-site visual redesign (`redesign/schbang-direction` branch)

This branch reskins the public site's visual language on top of the same backend/content-admin wiring
described everywhere else in this file — no Prisma/route/server-action changes. **It's scoped, not
global**: only the five page components (`src/app/(site)/{page,services,how-we-work,faq,contact}/page.tsx`)
plus shared chrome (`site-header.tsx`, `site-footer.tsx`, `logo.tsx`, `numbered-rows.tsx`,
`faq-accordion.tsx`, `contact-form.tsx`) were touched. **The admin panel, the blog routes
(`src/app/(site)/blog/`), and the revenue-check quiz (`src/components/home/revenue-check.tsx`) were not
touched** and still render the original navy-900/blue-500 theme — don't assume the redesign reaches those
just because it's the active branch, and don't be surprised to see both themes in the same `grep`.

- **GSAP joins Framer Motion as a second animation system** (`gsap` + `@gsap/react` added to
  `package.json`) rather than replacing it — the existing `Reveal`/`RevealGroup`/`RiseWords`/`GrowBar`
  primitives (see "Architecture" above) are reused as-is on the redesigned pages too.
  `src/components/gsap/gsap-registry.ts` registers `ScrollTrigger` + `ScrambleTextPlugin` once at module
  load (both free since Webflow's 2024 GreenSock acquisition — no Club GreenSock license needed) and
  exports a shared `prefersReducedMotion()` helper; `ScrambleReveal` below checks it and renders plain
  static text instead — the GSAP-side equivalent of `MotionConfig reducedMotion="user"` on the Framer
  Motion side.
  - **Removed:** Home's two service lines (Research/Marketing) originally sat in a GSAP ScrollTrigger
    pin+scrub horizontal "scroll-jacking" slider (`src/components/gsap/horizontal-scroll-section.tsx`,
    `HorizontalScrollSection`). It went through three different pin/scrub configurations, each fixing one
    real bug and surfacing another (a blank dead-zone while pinned with the viewport unfilled; a slide that
    rushed past before finishing when unpinned; pinned content overlapping the next section once pinned
    correctly but with `pinSpacing`/`pinType` auto-detection silently reserving zero extra scroll distance
    for this nested-flex layout) — confirmed each time by driving a headless Chrome instance and reading
    GSAP's own `ScrollTrigger.start`/`.end` and the rendered `.pin-spacer`, not by eyeballing it. After
    repeated real-world reports that it still rendered wrong, it was pulled out entirely and replaced with a
    plain static two-up grid (same visual panels, `CAPABILITY_SERVICES.map(...)` in
    `src/app/(site)/page.tsx`, no scroll-jacking) — don't reintroduce a pinned/scrubbed version of this
    section without being able to verify it the same rigorous way; it is not a component to eyeball-test in
    a live browser only.
  - `src/components/gsap/scramble-reveal.tsx`'s `ScrambleReveal` scrambles random characters into real text
    once, on scroll-into-view (`ScrollTrigger` `once: true`) — used for eyebrows and the header's nav-label
    strip. Renders plain static text under reduced motion.
  - `src/components/schbang/section-intro.tsx`'s `SectionIntro` is the shared "eyebrow + headline + giant
    arrow glyph + CTA" row reused across sections (Home's "What defines us", FAQ-adjacent blocks) instead of
    one-off flex-rows per section; its eyebrow is always wrapped in `ScrambleReveal`.
- **Colour swap, reusing existing tokens — nothing new added to `@theme inline`:** `navy-900/800/700` and
  the `blue-*` accents are retired on the touched pages in favor of the existing `ink` (`#0f172a`) token for
  dark sections and `orange-500`/`orange-400` as the single accent colour, replacing `blue-300`/`blue-600`
  everywhere `splitFirstSentence()`/`splitLastWord()` (see "Backend: content admin" below) supply the
  accented half of an admin-edited heading — those helpers themselves stayed colour-agnostic; only the
  calling page's class changed.
- **`Logo` (`src/components/logo.tsx`) gained a `variant?: "dark" | "light"` prop**: `"dark"` (the default)
  is the original white-on-navy mark, unchanged, and is what every non-redesigned call site (admin
  login/sidebar, Team accept-invite) still uses; `"light"` renders `text-ink` for the new white-background
  `SiteHeader`. It's a real prop rather than an appended className because Tailwind's generated CSS order
  doesn't guarantee a later-appended `text-*` class wins the cascade over one already baked into the
  component.
- Scale was deliberately tightened twice after review found an initial pass "too large/cinematic" — current
  sizes/padding sit closer to the original site's proportions than that first draft did. Per the branch's
  own commit message, fabricated trust signals (client logos, stats, case studies) were
  deliberately **not** added even though the Schbang reference site has them — flagged as missing rather
  than invented, since this is a live marketing site.
- **Six standalone service landing pages** sit under `src/app/(site)/` — one per sub-service listed on
  `/services`: `market-research-services`, `consumer-behaviour-satisfaction-analysis-services`,
  `campaign-analytics-services`, `seo-services`, `brand-campaign-strategy-services`,
  `social-media-marketing-services`. All content (copy, meta title/description, FAQs, related-service
  links) lives in `src/lib/service-pages-data.ts`'s `SERVICE_PAGES` array, taken from a client-supplied doc
  ("Kargatox – SEO Content for 6 Service update") — same word-for-word rule as the rest of the site's copy
  (see "Key constraints" below), with two corrected broken fragments noted inline in that file where the
  source doc itself was broken. Each `src/app/(site)/<slug>/page.tsx` is just a `metadata` export plus
  `<ServiceLandingPage content={getServicePage("<slug>")} />` — `src/components/services/
  service-landing-page.tsx`'s `ServiceLandingPage` is the one shared template (hero, numbered "what we
  cover" rows via `NumberedRows`, an approach panel with optional numbered steps, `BulletList` columns, an
  FAQ accordion reusing `FaqAccordion` from `/faq`, a "related services" chip row) — there's no per-page
  layout code beyond the metadata export.
- **Wired into nav/footer/hub, not just reachable by URL:** `SiteHeader`'s "Services" nav item is now a
  hover/focus CSS-only dropdown on desktop (grouped Research/Marketing via `SERVICE_PAGE_GROUPS`) and an
  expanded sub-list under "Services" in the mobile drawer; `SiteFooter` gained a "Services" column listing
  all six; the `/services` hub's sub-service cards resolve their "Learn more" link through
  `SUB_SERVICE_HREFS` (a `navTitle` → `/slug` map keyed by the exact `SubService.title` strings in
  `src/app/(site)/services/data.ts`) instead of the previous dead `href="#"` — a renamed or admin-added
  sub-service row that isn't one of these six slugs just renders with no link rather than a broken one.

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
- **`src/lib/mailer.ts`** — the single `sendMail({ to, subject, text })` helper all email paths go through
  (enquiry notifications/auto-replies, admin replies). It lazily builds a
  nodemailer transport from `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`; if any are missing it
  caches `null` and `sendMail` just `console.log`s what it would have sent instead of throwing, so the rest
  of the flow (enquiry save, admin reply, sign-in) still works end to end without an SMTP account
  configured. `SMTP_FROM` (falling back to `SMTP_USER`) sets the From header.
- **`src/lib/email.ts`** — `sendEnquiryEmails()` builds the two messages the README calls for (an admin
  notification to `ADMIN_NOTIFY_EMAIL`, skipped if unset, plus a customer auto-reply) and sends both via
  `sendMail()` above. Enquiries save to the DB regardless of whether either send succeeds/is configured:
  every call site (`POST /api/enquiries`, `sendReply` in the Enquiries admin actions) does the DB
  write/status update first, then wraps the `sendMail`/`sendEnquiryEmails` call in its own `try`/`catch`
  that just `console.error`s — so a real SMTP failure (not just "unconfigured", which `mailer.ts` already
  no-ops on) can't turn a saved enquiry or a sent reply into a 500 for the caller. Follow this same
  save-first-then-best-effort-email pattern for any new mutation that sends mail.
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
- The admin **Revenue checks** page (`/admin/revenue-checks`, `src/app/admin/(protected)/revenue-checks/
  page.tsx`) is a real server component now: summary tiles (total checks, % with each weakest area) plus a
  table of every `RevenueCheck` row with a per-area `ScoreBar` (0/1/2 → 25%/60%/100% width, colour per the
  README's score-colour spec) and an "Outcome" column showing whether the check's linked `enquiries` is
  non-empty.

## Auth and the admin panel

Auth.js v5 (`next-auth@5.0.0-beta.32`) with the Prisma adapter, used only for session storage/reading —
**sign-in is password-only.** Magic-link email sign-in (the original primary path) was removed; there's no
self-serve signup and no OAuth providers, so password is the sole way in.

- **`src/auth.ts`** — `NextAuth({ ... })` exports `handlers`/`auth`/`signIn`/`signOut`, configured with
  `providers: []`. Session strategy is `"database"` (sessions live in the `Session` table, not JWT) —
  that's still needed so `auth()` can read back the `Session` rows `createPasswordSession()` writes (see
  below); the adapter is required for the same reason. With no providers, Auth.js's own sign-in flow never
  runs, so there's no `signIn` callback either — the "don't let an unknown email become a `User`" guarantee
  now lives entirely in `signInWithPassword()`'s `prisma.user.findUnique` + password check. The `session`
  callback still copies `id`/`role` from the `User` row onto `session.user`.
- **`src/types/next-auth.d.ts`** — module augmentation so `session.user` is typed with `id`/`role` (a
  `Role` from `src/lib/roles.ts`) and non-nullable `email`.
- **Password login (`src/lib/password-auth.ts`, `signInWithPassword` in `src/app/admin/login/actions.ts`)**
  is the only sign-in path. Deliberately **not** implemented as an Auth.js `Credentials` provider: that
  requires `session.strategy: "jwt"`, which conflicts with the `"database"` strategy configured above.
  Instead, `createPasswordSession()` creates a `Session` row and sets the `authjs.session-token` /
  `__Secure-authjs.session-token` cookie directly — the exact same shape Auth.js's own adapter flow would
  produce (same `crypto.randomUUID()` token, same cookie name/attributes; see
  `node_modules/@auth/core/lib/utils/cookie.js` and `.../callback/handle-login.js` for the reference
  behaviour this mirrors) — so `auth()` and the `(protected)` layout's session check need no special-casing.
  `User.password` is an optional bcrypt hash (`bcryptjs`, pure JS — avoids native-binary cross-compile
  issues between a Windows dev machine and Vercel's Linux runtime) but **required in practice**: a `User`
  row with no password can't sign in at all now. Login attempts are rate-limited (`src/lib/rate-limit.ts`,
  keyed by IP) since, unlike a magic link, a password is guessable. There's still no UI to set a password —
  it's set via `npm run db:seed` (pass `SEED_OWNER_PASSWORD`) for the seeded owner, or directly via a
  one-off Prisma script (`hashPassword()` + `prisma.user.update`) for anyone else.
- **`src/lib/roles.ts`** — `ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"]` and permission helpers like
  `canAccessEnquiries()` (Owner/Admin/Sales, per the README's Team section — Editor gets pages/services/
  FAQ/blog instead). Add new permission checks here, not inline in routes/components.
- **Route protection has no `middleware.ts`** — it's done at the layout level.
  `src/app/admin/(protected)/layout.tsx` calls `auth()` server-side and `redirect("/admin/login")` if
  there's no session; everything under that route group (dashboard, enquiries, etc.) inherits the check.
  `src/app/admin/login/` (the login page and its `signInWithPassword` server action) lives *outside*
  `(protected)` so it's reachable when signed out.
- **Server actions re-check permissions themselves**, not just the UI — e.g.
  `src/app/admin/(protected)/enquiries/actions.ts`'s `requireEnquiryAccess()` calls `auth()` and
  `canAccessEnquiries()` at the top of every mutation (`updateEnquiryStatus`, `assignEnquiry`,
  `sendReply`). This is the pattern to copy for any new mutation — see "Key constraints" below.
- **Admin nav (`src/lib/admin-nav.ts`)** lists the full README-spec sidebar (Dashboard, Enquiries, Revenue
  checks, Pages, Services & FAQ, Blog & case studies, Team, Settings) — every item is a real page now, no
  `<ComingSoon>` placeholders left (that component was deleted once the last section was built).
- **Enquiries** (`src/app/admin/(protected)/enquiries/`): `page.tsx` is a server component that loads
  enquiries + team members and hands them to the client `EnquiriesView` (`src/components/admin/
  enquiries-view.tsx`) for filtering, a detail panel, reply templates, and status/assignment controls, all
  backed by the server actions above. `GET /api/admin/enquiries/export` streams the same data as CSV
  (role-gated the same way, respects an optional `?status=` filter).
- **Dashboard** (`src/app/admin/(protected)/page.tsx`) runs real Prisma queries (total count, last-30-days
  count, a 12-week bucketed chart, latest 4 enquiries) — no fake numbers. The README's GA-backed widgets
  (traffic sources, visitors, top pages) are deferred to step 9 (analytics), not stubbed with placeholder
  data.
- **The admin shell is responsive** (`src/components/admin/admin-shell.tsx`, a client component wrapping
  `AdminSidebar` + `AdminTopbar`, swapped in from the server `(protected)/layout.tsx`). Below the `lg`
  breakpoint the 240px sidebar becomes a `fixed`, `z-40` off-canvas drawer (`-translate-x-full` ↔
  `translate-x-0`, `motion-reduce:transition-none`) opened by a hamburger button in `AdminTopbar`; at `lg`+
  it reverts to the original `sticky`/always-visible layout via `lg:` overrides on the same classes. Closing
  happens three ways: tapping a nav link (`onClose` passed into `AdminSidebar`), tapping the dedicated ✕
  button inside the sidebar's own header, or tapping the backdrop — **not** by tapping the topbar's
  hamburger again, because the open sidebar sits above the topbar in z-index and physically covers it; the
  topbar button only opens. The backdrop is a plain `aria-hidden` `<div>`, not a `<button>`, so it doesn't
  duplicate the sidebar's own close button in the accessibility tree. `AdminShell` resets `open` to `false`
  on route change using the same render-time pathname-reset pattern as `SiteHeader` (see "Architecture"
  above), not `setState` inside `useEffect`.
- **Team** (`src/app/admin/(protected)/team/`) replaces `npm run db:seed`/`admin:set-password` as the way
  to add teammates — Owner/Admin only (`canAccessTeam()` in `src/lib/roles.ts`), enforced the same way as
  `requireEnquiryAccess()`. `+ Invite member` (`inviteMember` in `actions.ts`) creates a `User` row with no
  password (`invitedAt` set, `role` restricted to `ADMIN`/`EDITOR`/`SALES` — see
  `src/lib/team-schema.ts`'s `INVITE_ROLE_OPTIONS`; Owner isn't invitable, it's the single seeded/billing
  role), blocked past `MAX_TEAM_SEATS` (5, per the README), reusing the Auth.js-adapter `VerificationToken`
  table for the invite token (`identifier` = email, 7-day expiry) and emailing a link via `sendMail()` to
  `/admin/accept-invite?token=...` — a page outside `(protected)` (same reason `/admin/login` is) where the
  invitee sets a password (`acceptInvite` in `src/app/admin/accept-invite/actions.ts`) and is signed in via
  the same `createPasswordSession()` the password-login flow uses. Role changes/removal
  (`updateMemberRole`/`removeMember`) block touching the Owner role in either direction (can't reassign away
  from it, can't promote into it) — README: "The Owner cannot be removed." `lastActiveAt` is stamped on
  every `createPasswordSession()` call (both normal sign-in and invite acceptance), which is what the
  Team page's "last active" column reads; `invitedAt`/`acceptedAt` (null for users created via
  `db:seed`/`admin:set-password` directly, not through an invite) distinguish a pending invite from an
  accepted one when `lastActiveAt` is still null.

## Backend: content admin (Pages, Services & FAQ, Blog, Settings)

Steps 7–8's remaining four sections all share one access pattern: `canAccessContent()` (Pages/Services &
FAQ/Blog — Owner/Admin/Editor, per the README's "Editor: pages, services, FAQ and blog") and
`canAccessSettings()` (Settings — Owner/Admin only, same role set as Team but kept as its own helper since
the two concerns are unrelated), both in `src/lib/roles.ts`, checked the same `requireXAccess()`-at-the-top
way as `requireEnquiryAccess()`.

- **Pages** (`src/app/admin/(protected)/pages/`) is a draft/publish editor over the exact fields the
  README's Pages section lists (Home: hero headline/subheading, capabilities heading/body; Services: intro
  headline/paragraph 1/paragraph 2; How we work: headline/subline/straight-up note; FAQ: heading; Contact:
  heading/intro) — not a general page builder. `PageContent` (`prisma/schema.prisma`) is one row per page
  (`page` is `"home" | "services" | "how-we-work" | "faq" | "contact"`), with a `published` JSON blob
  (always populated post-first-publish) and a `draft` JSON blob (`null` until someone edits a field — that's
  the list's green/orange dot). There's **no seed step**: `src/lib/page-content-defaults.ts`'s
  `PAGE_DEFAULTS` holds the exact original hardcoded copy, and `getPublishedPageContent()`
  (`src/lib/page-content.ts`) merges `{ ...defaults, ...published }`, so a page with no row yet (or a
  published blob missing a newer field) still renders correctly — same "default until edited" shape as
  everything else in this section. `savePageDraft`/`publishPage` (`actions.ts`) write the draft/published
  JSON directly from whatever the editor's textareas currently hold (no separate "are you sure the draft
  matches" step); `publishPage` also `revalidatePath`s the live route. The five public page components
  (`src/app/(site)/{page,services,how-we-work,faq,contact}/page.tsx`) are now `async` Server Components that
  call `getPublishedPageContent()`. **"Preview ↗" just links to the live public page** (showing published
  content, not the draft) — there's no Next.js Draft Mode integration; building real draft previews is a
  deliberate deferral, not an oversight.
  - Three fields reproduce a two-tone heading style from plain text so the original visual design survives
    an admin edit: `src/lib/text-split.ts`'s `splitFirstSentence()` (first sentence plain, the rest accented
    — Home's capabilities heading and FAQ's heading) and `splitLastWord()` (every word but the last plain,
    last word accented — Contact's heading). The helpers themselves just split strings; the accent colour is
    whatever class the calling page applies — on `main` that's `text-blue-600` (first-sentence fields) /
    `text-blue-300` (last-word fields), but on the `redesign/schbang-direction` branch (see "Public-site
    visual redesign" above) every one of those call sites was repointed to `text-orange-500`/`orange-400`
    instead. Home's hero headline uses its own word-level version of the same idea: it's fed through
    `RiseWords` (see "Architecture" above) as one word per array entry, with only the **last** word getting
    the accent class — this is what reproduces the original "Growth." accent for any edited headline, not
    just the default. How-we-work's headline is
    plain `"line one\nline two"` — split on the literal newline, second line rendered dimmed
    (`text-white/70`) after a `<br/>`. None of this is configurable from the editor beyond typing the text;
    it's baked into each page's rendering, not a generic rich-text feature.
- **Services & FAQ** (`src/app/admin/(protected)/services-faq/`) has **no draft/publish** — a single "Save
  changes" button bulk-replaces the live content, matching the README exactly (unlike Pages). `SubService`
  (`serviceKey: "research" | "marketing"`, ordered) and `FaqItem` (ordered) are the editable rows; the
  Services page's non-editable per-service content (the "SAMPLE DATA" dashboard panel — bars/KPIs/keywords/
  channels/tagline/intro) stays hardcoded in `src/app/(site)/services/data.ts`, only `SERVICES[].items`
  (title/body/link) comes from the DB. Same "default until edited" fallback as Pages: `getSubServiceItems()`
  / `getFaqItemsOrDefault()` (`src/lib/services-content.ts`) return `data.ts`'s hardcoded items /
  `src/lib/faq-defaults.ts`'s `FAQ_DEFAULTS` when the respective DB table has zero rows for that key, so
  nothing needs seeding and the public Services/FAQ pages never render empty. `saveServicesAndFaq()`
  (`actions.ts`) takes the *entire* current state of every service's sub-service array plus the entire FAQ
  array in one call (not a diff) and replaces each set inside a transaction (`deleteMany` + `createMany`,
  `order` reassigned from array index) — reorder/add/remove in the UI are all local array state until Save.
- **Blog & case studies** (`src/app/admin/(protected)/blog/`, public `src/app/(site)/blog/`) is a `Post`
  model (`type: "BLOG" | "CASE_STUDY"`, `status: "DRAFT" | "PUBLISHED"`, `authorId` → `User`, `body` is
  Tiptap's own JSON serialized to a string) with a Tiptap editor (`@tiptap/react` + `@tiptap/starter-kit`,
  `immediatelyRender: false` to avoid an SSR hydration mismatch) in `src/components/admin/post-editor.tsx`.
  **No cover image field** — the README calls for one (S3/Supabase/Vercel Blob), but none of those are
  configured, so it was deliberately left out rather than built against a storage provider that doesn't
  exist yet; add it once one is provisioned. `src/lib/post-schema.ts`'s `slugify()` auto-fills the URL slug
  from the title as you type, until the slug field itself is manually edited (then it stops auto-updating).
  `saveDraft`/`publishPost` (`actions.ts`) upsert by `id` (`null` = create) and re-check the slug is unique
  across other posts; `publishPost` preserves the original `publishedAt` across re-publishes of an
  already-live post rather than resetting it. Public rendering goes through
  `src/lib/render-post-body.ts`'s `renderPostBody()` (`@tiptap/html`'s `generateHTML`, server-side, no DOM
  needed) into `dangerouslySetInnerHTML` on `/blog/[slug]` — safe specifically because the HTML only ever
  contains node/mark types StarterKit defines (Tiptap's own JSON schema, not arbitrary user HTML) and only
  `canAccessContent()` roles can write a `Post` at all. **No nav link was added** for `/blog` — the README's
  five-page prototype design doesn't show one, so the public blog routes are live but only reachable by
  direct URL for now; add a nav entry if/when that's wanted.
- **Settings** (`src/app/admin/(protected)/settings/`) covers only **General** (site name, notification
  email, also-notify, auto-reply message with a `{firstName}` placeholder, a send-auto-reply switch) and
  **Google Analytics** (measurement ID + enabled switch) from the README's spec — deliberately scoped down.
  The **SEO section is out of scope entirely** (meta title/description/social image/sitemap/indexing
  switches — that's step 9). The **CRM/WhatsApp/Slack/Meta Pixel integration cards are out of scope** (no
  provider chosen/credentials available). **SMTP is read-only status, not an editable field** — on
  purpose: the README's spec has SMTP as an editable Settings card, but that would mean storing the SMTP
  password in Postgres instead of only in Vercel's encrypted env vars, so `src/app/admin/(protected)/
  settings/page.tsx` just computes `smtpConfigured` the same way `src/lib/mailer.ts`'s `getTransporter()`
  does and shows a CONNECTED/NOT CONFIGURED badge — host/port/user/password stay `SMTP_*` env-only. Writes
  go through a singleton `Settings` row (fixed `id: "singleton"`, see `src/lib/settings.ts`'s
  `getSettings()`) — same "no row yet = defaults" fallback pattern as Pages/Services & FAQ, so nothing needs
  seeding. `src/lib/email.ts`'s `sendEnquiryEmails()` now reads `Settings.notificationEmail`/`alsoNotify`
  (falling back to the `ADMIN_NOTIFY_EMAIL` env var if `notificationEmail` is unset) and
  `Settings.sendAutoReply`/`autoReplyMessage` instead of the old hardcoded text. The GA snippet
  (`gtag.js`) is injected in **`src/app/(site)/layout.tsx` only, never the root layout** — the admin panel
  must never pick up site analytics tracking, same reasoning as why `SiteHeader` lives in the `(site)`
  layout and not the root one (see "Architecture" above).

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
- Auth.js (NextAuth), role-based access control (OWNER/ADMIN/EDITOR/SALES). **Set up** (see "Auth and the
  admin panel" above) — sign-in is password-only (magic link was removed). The Team invite flow (see "Auth
  and the admin panel" above) is now built, so `npm run db:seed`/`admin:set-password` are only needed for
  the first Owner account — every other user is added via `/admin/team`.
- Resend (or SMTP) for enquiry notifications, auto-replies, and admin replies. **Set up** — SMTP via
  `nodemailer`, routed through the shared `src/lib/mailer.ts` helper (see "Backend: the enquiries API"
  above); without `SMTP_*` env vars configured it falls back to the same `console.log` stub pattern as
  before.
- Framer Motion for animation — set up (`src/components/motion/`); decorative infinite loops (background
  orbs, the sub-service marquee) use plain CSS keyframes in `globals.css` instead, not Framer Motion. (The
  `redesign/schbang-direction` branch adds GSAP/ScrollTrigger alongside it for scroll-jacking and text-
  scramble effects — not in the handoff README, see "Public-site visual redesign" above — and is not on
  `main`.)
- Page copy, services, FAQ and posts live in the database, edited via the admin panel, read by public
  pages at build time with ISR revalidation on publish. **Set up** — see "Backend: content admin (Pages,
  Services & FAQ, Blog, Settings)" above. Each piece of content still has a hardcoded fallback (the
  original copy/data) for when no DB row exists yet, rather than requiring a seed step.

Suggested routes, the Prisma data-model sketch, and the 9-step build order are in
`design_handoff_kargatox/README.md` — follow that order (scaffold → public pages → contact API → revenue
check → Prisma/auth/admin shell → enquiries/revenue-checks/dashboard → pages/content/posts → team/settings
→ SEO/analytics/a11y) rather than re-deriving a sequence. **Steps 1–8 are all done** — see "Backend: content
admin (Pages, Services & FAQ, Blog, Settings)" above for 7–8's content sections, and "Auth and the admin
panel" above for Team. **Next up: step 9 (SEO/analytics/a11y)** — GA is already wired in via Settings, but
sitemap.xml/robots.txt, structured data, Open Graph defaults, and an accessibility/Lighthouse pass are all
still open.

## Key constraints to preserve when rebuilding

- Site copy comes from `design_handoff_kargatox/content/Website-content.pdf` verbatim — don't paraphrase.
- The prototype **data** (dashboard numbers, sample enquiries, team names, "SAMPLE DATA" panels on
  Services) is placeholder and must not be treated as real content.
- Role permissions (Owner/Admin/Editor/Sales, described in the README's Team section) must be enforced
  server-side, not just hidden in the UI — see `requireEnquiryAccess()` in
  `src/app/admin/(protected)/enquiries/actions.ts` for the pattern every new mutation/route should follow.
- Animations must respect `prefers-reduced-motion: reduce` (all easing is `cubic-bezier(.2,.7,.1,1)` per
  the README).
