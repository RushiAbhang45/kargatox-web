# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The Kargatox marketing site is being **rewritten from Next.js/TypeScript/React/Prisma to a plain
Node/Express/EJS/vanilla-JS app** — no framework, no client-side framework, no build step beyond a
Tailwind CLI pass. The previous Next.js app (which had the full feature set: Postgres/Prisma, Auth.js
admin panel, enquiries pipeline, revenue-check quiz, blog, team invites, settings — see its own commit
history) was moved verbatim into **`legacy-nextjs-app/`** as a frozen reference (commit `24f727c`) and is
not run or edited going forward. It exists so later rewrite phases can port its logic/content
1:1 instead of re-deriving it — when a file here says "ported from legacy-nextjs-app/...", that's a
real source file to diff against, not a guess.

**Where the rewrite stands:** Phase 1 is done (commit `c8ecbf2`) — an Express entry point, Tailwind v4
CLI pipeline, and all 11 public page templates (home, services, how-we-work, faq, contact, the 6
service-landing pages via one shared template, plus placeholder blog routes) rendering hardcoded content,
no database. Phase 10 is also mostly done (commit `afdb1c0`, see `public/js/site.js`). After that, the
site's deploy target briefly changed to a prerendered static build (commit `775b6fd`), then changed back
to a live Node function (commit `dcdc668`) once the admin panel below needed real server-side DB/session
handling — see "Deploy target: live Node function on Vercel" in Architecture below; don't trust the
static-prerender framing as current. The remaining phases are tracked only as inline code comments (grep
for `Phase \d`), not a separate plan doc:
- **Phase 2** — wire a database back in **for the public site**; swap the hardcoded
  `PAGE_DEFAULTS`/`FAQ_DEFAULTS`/sub-service content in `routes/site.js` for a real DB-backed merge (the
  "default until a row exists" pattern the legacy app used). The DB this would read from already exists
  (see "Admin panel, auth, and database" below) — `routes/site.js` just doesn't query it yet. Note this
  would also need to feed the static-prerender script (see Architecture) or that script's output goes
  stale against the DB.
- **Phase 3** — `POST /api/enquiries`: real submit handling for the Contact form, including the
  honeypot/prefill logic currently only sketched as static markup in `views/site/contact.ejs`. Move
  `SERVICE_OPTIONS` (currently inlined in that template) into a shared `lib/enquiry-schema.js` once this
  lands, so the API route and the `<select>` read from one place. The admin Dashboard already reads
  `Enquiry` rows (see below) but will show all-zero counts until this phase actually creates any.
- **Phase 8** — blog & case studies rendering (`views/site/blog-list.ejs` / `blog-post.ejs` are placeholder
  routes today; the admin sidebar's "Blog & case studies" link is also still a placeholder, see below).
- **Phase 10 (mostly done, one piece left)** — `public/js/site.js` wires the mobile nav drawer toggle
  (`site-header.ejs`'s `#mobile-menu-toggle`/`#mobile-menu`), the FAQ accordion's click-to-toggle
  (`faq-accordion.ejs`'s `data-faq-trigger`/`data-faq-panel` hooks), and the scramble-text effect
  (`data-scramble-reveal` attributes). **Not done:** `numbered-rows.ejs`'s grow-in underline animation —
  its own header comment still says the underline "renders at its final (fully grown) width" and the
  grow-in itself remains unbuilt; don't assume it's covered by the rest of Phase 10 landing.
- **Phases 4–7/9, partially started** — a minimal admin panel (login, Dashboard, Team, Settings — commit
  `5a6b9d0`) now exists with a real Postgres/Prisma DB and its own cookie-based auth, built directly into
  this app rather than ported from `legacy-nextjs-app/`. See "Admin panel, auth, and database" below for
  what's real vs. still a placeholder link — Enquiries, Revenue checks, Pages, and Services & FAQ have no
  backing routes yet, so treat the legacy app's equivalent sections as the spec for those, same as
  Phase 1–3/8/10 above.

Don't assume feature parity with `legacy-nextjs-app/` just because this is "the current app" — anything
not listed as done above (DB-backed *public-site* content, the enquiries API, revenue-check quiz, most of
the admin panel, blog rendering, the one remaining animation) simply isn't built yet in this rewrite.

## Commands

- `npm run dev` / `npm start` — both just run `node server.js`, listening on `http://localhost:3000`
  (`PORT` env var to override). There's no watch/reload — restart manually after server-side changes.
- `npm run build:css` — runs the Tailwind v4 CLI (`@tailwindcss/cli`) once over `public/css/input.css` →
  `public/css/styles.css` (minified). Templates read `/css/styles.css`, which is committed — **re-run this
  after any class/token change in `public/css/input.css` or any `.ejs` file**, since there's no dev-time
  watcher rebuilding it for you.
- `npm run build:static` — runs `scripts/build-static.js`, which boots the real Express/EJS app (`require("../server.js")`)
  on an ephemeral port, HTTP-fetches every known public route, and writes each response verbatim to a flat
  `public/<slug>.html` (plus a static `public/404.html`). These generated HTML files **are committed** — re-run
  this (or `npm run build`) and commit the diff after any route/content/template change, or the deployed
  static output silently drifts from what `npm run dev` renders.
- `npm run build` — runs `build:css` then `build:static`. Still worth running after a public-page content/
  template change (see the deploy-target note in Architecture for why this no longer gates production the
  way it used to), but it is **not** the deploy mechanism anymore.
- `postinstall` (`prisma generate`) runs automatically on `npm install` — needed for `@prisma/client` to
  exist at all; there's no `prisma migrate`/`db:seed` script in `package.json` yet (migrations are owned
  by `legacy-nextjs-app/`, which shares this DB — see "Admin panel, auth, and database" below).
- No lint script and no test suite in this rewrite (the legacy app had both; neither has been re-added here).
- Public-site pages still need no `.env`. The admin panel does: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
  and `AUTH_SECRET` are now genuinely read (`lib/db.js`, `lib/admin-auth.js`) and required for anything
  under `/admin` to work — `/admin/login` throws if `AUTH_SECRET` is unset. The committed `.env.example`'s
  `SMTP_*`/`ADMIN_NOTIFY_EMAIL` block is still **not** consumed by anything here (no `lib/mailer.js` exists;
  that comment block still literally points at `src/lib/mailer.ts`, a `legacy-nextjs-app/`-only path) —
  check `server.js`/`routes/`/`lib/` for actual `process.env` reads before assuming any given env var does
  something in this app.

## Architecture

- **`server.js`** is the entire app bootstrap: creates the Express app, sets `view engine`/`views` to
  `ejs`/`./views`, and mounts `routes/site.js` at `/` **before** `express.static("./public")`. That order
  is deliberate, not incidental (commit `9966970`): `public/*.html` is prerendered output that this same
  server also serves at those same paths (e.g. `public/index.html` for `GET /`), so if static came first it
  would permanently shadow the live EJS route with whatever was last prerendered — including when
  `build-static.js` itself scrapes this server, which would silently re-write the same stale content back
  to itself. Static stays mounted (after the router) for genuine assets (`/css`, `/js`, `/images`,
  `/favicon.ico`) that have no matching route. It exports the `app` (for a future serverless target) and
  only calls `.listen()` when `process.env.VERCEL` isn't set.
- **Shared, request-independent data goes on `app.locals`, not `require()` inside templates.** EJS
  templates rendered via `res.render()` don't close over `server.js`'s `require` — so `NAV_LINKS`,
  `SERVICE_PAGES`/`SERVICE_PAGE_GROUPS`/`SUB_SERVICE_HREFS`, `PROCESS_STEPS`, and `SERVICES` are all
  attached to `app.locals` in `server.js` and read by name directly in partials (e.g. `site-header.ejs`
  references `NAV_LINKS`, `SERVICE_PAGE_GROUPS`, `SERVICE_PAGES` with no `include(...)` argument passing
  them in). Anything that's per-request or page-specific instead comes in as a `res.render()` locals object
  from the route handler — that split (locals-for-shared vs. render-args-for-per-page) is the pattern to
  follow for new data.
- **`routes/site.js`** is a single router: one `GET` handler per public page, a `Set`-checked `GET /:slug`
  for the six service-landing pages (explicit slug allowlist, not a catch-all — an unknown path falls
  through to the final 404 handler in `server.js` instead of rendering with undefined content), and
  placeholder `GET /blog` / `GET /blog/:slug` routes. Each handler does any server-side content shaping
  (e.g. `splitFirstSentence`/`splitLastWord` from `lib/text-split.js`) before calling `res.render()` — views
  stay free of that logic.
- **`lib/*.js`** holds plain CommonJS modules ported from the legacy app's `src/lib/*.ts` — same data,
  same shape, no TypeScript/zod: `page-content-defaults.js` (`PAGE_DEFAULTS`, the hardcoded fallback copy
  per page), `faq-defaults.js`, `nav-links.js`, `process-steps.js`, `services-data.js` (the Services page's
  non-editable "SAMPLE DATA" dashboard panel content), `service-pages-data.js` (all six service-landing
  pages' copy/FAQs/related-links, sourced word-for-word from the client's "Kargatox – SEO Content for 6
  Service update" doc), and `text-split.js` (`splitFirstSentence`/`splitLastWord`, the two-tone-heading
  helpers). Each file's header comment names its `legacy-nextjs-app/src/lib/*.ts` source — check that file
  first if behavior looks wrong, since it's the originally-reviewed version.
- **EJS view conventions** (`views/site/*.ejs` = full pages, `views/partials/*.ejs` = includable
  fragments):
  - Every page/partial opens with a comment naming its `legacy-nextjs-app/src/.../*.tsx` source and listing
    what locals it expects — read that comment before editing, it's the prop contract.
  - Partials take "props" as the object literal passed to `include('partial-name', { ... })`; optional
    props are read defensively with `typeof x !== "undefined" ? x : default` since EJS doesn't error on a
    missing local the way a TS component would on a missing prop (see `logo.ejs`'s `variant`/`className`,
    `numbered-rows.ejs`'s `className`, `site-footer.ejs`'s `showCta`).
  - Page-local static arrays that aren't DB-editable (e.g. home's `PILLARS`/`CAPABILITY_SERVICES`/`TICKER`,
    contact's `STEPS`/`SERVICE_OPTIONS`) are declared inline in a `<% ... %>` block at the top of the
    template, mirroring where the legacy `page.tsx` had them in module scope — don't hoist these into
    `lib/` unless a second page needs the same array.
  - DOM hooks for interactivity are named and present in the markup — `data-faq-trigger`/`data-faq-panel`,
    `#mobile-menu-toggle`/`#mobile-menu`, `data-scramble-reveal="..."` — and `public/js/site.js` (Phase 10)
    now binds behavior to all three via plain `<script defer>`, no build step. Keep using these exact
    attribute/id names rather than introducing new ones. `numbered-rows.ejs`'s grow-in underline is the one
    DOM/animation piece still unwired — its underline `<div>` has no `data-*` hook yet, so that part of
    Phase 10 still needs both a markup hook and the `site.js` behavior, not just the latter.
- **Tailwind v4 is CSS-first — there is no `tailwind.config.js`.** All tokens live in the `@theme inline`
  block of `public/css/input.css`, ported verbatim (same names/hex values) from the legacy app's
  `globals.css`. Colours (`navy-*`, `orange-500/400`, `blue-*`, `paper`/`ink`/`slate`/`mist*`/`line*`,
  `chip-*`, `success*`, enquiry `status-*`, `admin-*`), `--width-site: 1240px`, `--radius-*`, and the
  `kx-float*`/`kx-marquee` keyframes (with a `prefers-reduced-motion: reduce` override already present)
  all carried over unchanged. **When adding a token, match this file's/the design handoff's naming and hex
  values exactly** — don't invent new colours or radii.
  - The one deliberate divergence from the legacy app: the `--font-display`/`--font-body`/`--font-mono`
    values are plain Google Fonts family names (`"Space Grotesk"`, `"Figtree"`, `"JetBrains Mono"`) loaded
    via a `<link>` in `views/partials/doc-head.ejs`, not `next/font`-generated CSS variables — there's no
    `next/font` here. Note this is **Space Grotesk**, not the Bricolage Grotesque the legacy app used as
    its display-font stand-in; if fidelity to the legacy app's rendered look matters, check which one is
    actually intended before assuming they're interchangeable. Real Clash Display/Satoshi self-hosting
    (the design handoff's actual spec) still hasn't been done in either app.
- **Admin panel, auth, and database now exist** — see the dedicated section below. Prisma/bcryptjs are
  real dependencies now (`package.json`), not legacy-only patterns to avoid; just don't assume the rest of
  the legacy admin's feature set (Auth.js, nodemailer, enquiries pipeline, revenue-check quiz) carried over
  too — most of it didn't, see that section for exactly what's real vs. placeholder.
- **Deploy target: live Node function on Vercel, not the static build.** `vercel.json` now uses the
  explicit v2 `builds`/`routes` form — `@vercel/node` on `server.js`, every path routed to it (commit
  `dcdc668`) — after briefly trying (and reverting, commits `43575cd`/`5bbcf58`) a hybrid multi-build
  config and, before that, a pure static deploy (`"outputDirectory": "public"`, commit `775b6fd`). The
  live Node function was necessary once the admin panel needed real per-request DB reads and signed-cookie
  session checks, which a static prerender can't do. **`scripts/build-static.js`'s own header comment is
  now stale** — it still claims "Vercel deploys that folder directly, no build step"; trust `vercel.json`,
  not that comment. In production, `server.js` behaves exactly like it does locally: its live EJS routers
  are mounted before `express.static`, so the committed `public/*.html` files (still regenerated by
  `npm run build:static`) are shadowed by the live render for every path that has a real route, and now
  only actually serve as `express.static` fallback content for paths with no matching route. Keep running
  `npm run build:css` after Tailwind/token changes regardless — `styles.css` is a static asset nothing
  rebuilds automatically on deploy. `scripts/build-static.js`'s `ROUTES` array is a hardcoded list derived
  from `NAV_LINKS` + `SERVICE_PAGES`; a new route added to `routes/site.js` also needs an entry there or it
  won't get prerendered. `/blog/:slug` is deliberately excluded (no real posts exist pre-Phase-8).

## Admin panel, auth, and database

A minimal admin panel exists, built directly into this app (`routes/admin.js`, `views/admin/*.ejs`,
`views/partials/admin-sidebar.ejs`, commit `5a6b9d0`) — **not** ported from `legacy-nextjs-app/`, unlike
everything else in this rewrite. `server.js` mounts it at `/admin` before `routes/site.js`, so admin
routes always take precedence over the public router and over `express.static`.

- **Database**: `prisma/schema.prisma` is a real data model (`User`, `Enquiry`, `RevenueCheck`,
  `EnquiryMessage`, `PageContent`, `SubService`, `FaqItem`, `Post`, `Settings`) describing a Postgres DB
  *shared* with `legacy-nextjs-app/prisma/schema.prisma` — this app only ever reads/writes rows; migrations
  are owned by the legacy app (there's no `prisma migrate`/`db:seed` script here, despite `.env.example`
  mentioning `npm run db:seed` — that script doesn't exist yet). `lib/db.js` exports a `PrismaClient`
  singleton cached on `global` so warm serverless invocations reuse one connection pool instead of opening
  a new one per request.
- **Auth**: `lib/admin-auth.js` is a stateless, signed-cookie session (`kx_admin_session`, HMAC-SHA256 over
  `AUTH_SECRET`, 30-day expiry, `HttpOnly`/`SameSite=Lax`/`Secure`-when-on-Vercel) — deliberately *not*
  Auth.js, even though it reads/writes the same `User` table the legacy app's Auth.js adapter used.
  `routes/admin.js`'s `requireAuth` / `requireTeamAccess` / `requireSettingsAccess` middlewares gate routes
  by session presence and by `role` (`OWNER`/`ADMIN`/`EDITOR`/`SALES` — only `OWNER`/`ADMIN` can reach Team
  or Settings).
- **What's actually built**: login (`GET`/`POST /admin/login`, `POST /admin/logout`), a Dashboard
  (`GET /admin`, reading real `Enquiry` rows for 30-day/total counts and a 12-week chart — see the Phase 3
  note above for why these currently read as zero), Team (seat-limited to `MAX_TEAM_SEATS = 5`, mirrors the
  already-reviewed "admin sets the password directly" flow from
  `legacy-nextjs-app/src/app/admin/(protected)/team/actions.ts`), and Settings (a `Settings` singleton row
  for site name/notification email/auto-reply message/GA measurement id).
- **What's still placeholder**: `views/partials/admin-sidebar.ejs` links to `/admin/enquiries`,
  `/admin/revenue-checks`, `/admin/pages`, and `/admin/services-faq` — none of those routes exist in
  `routes/admin.js` yet, so clicking them 404s. A link existing in the sidebar is not evidence the page
  behind it is built — check `routes/admin.js` directly.
- **Email is still not wired**: there's no `lib/mailer.js`. Don't assume `SMTP_*`/`ADMIN_NOTIFY_EMAIL` do
  anything here yet (see the Commands section's `.env` note).
- Required env for any of this to work locally: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`
  (see `.env.example`) — public-site pages still need none of it.

## Design reference material

Everything in this section lives under **`design-reference/`** — a dedicated folder (separate from
`legacy-nextjs-app/`, the frozen *code* backup) holding non-code reference/prototype material, kept out of
the repo root so the root only shows the actual deployable Express/EJS project.

- **`design-reference/design_handoff_kargatox/README.md`** — the original full spec: design tokens,
  per-screen behaviour/interactions/animations, responsiveness rules, a Prisma data-model sketch, and a
  suggested build order. Still the canonical source for colours/type/spacing/copy/interaction fidelity in
  this rewrite, same as it was for the legacy app. **Read it before implementing a new section.**
- **`design-reference/design_handoff_kargatox/content/Website-content.pdf`** — the client's source copy.
  Site copy must be taken from it **word for word** — this rule carried over unchanged from the legacy app
  and governs the content already ported into `lib/*.js`.
- **`design-reference/design_handoff_kargatox/designs/*.dc.html`** — Divhunt-style component prototypes
  (template markup + a `class Component extends DCLogic` script with logic/sample data), not plain HTML and
  not code to copy verbatim. Open directly in a browser (`support.js` must sit alongside); rebuild the
  behaviour shown using Express/EJS/vanilla-JS patterns, not by porting the markup as-is.
- The `.dc.html`/`support.js` files directly under `design-reference/` duplicate
  `design-reference/design_handoff_kargatox/designs/` for convenience. `design-reference/uploads/` holds
  copies of the source PDF/a screenshot, not authoritative. `design-reference/Kargatox Website.dc.html` is
  an earlier single-page-scroll concept that predates and is superseded by the multi-page structure in
  `designs/` — don't treat it as a spec.
- **`design-reference/kargatox-seo-meta-handoff.html`** is a generated **outgoing** snapshot (title/meta
  description/H1 per live route circa the legacy app, plus a "Known gaps" list) handed to an external SEO
  team — not an incoming spec. It predates this rewrite and will go stale further as Phase 2+ lands; don't
  treat its contents as current truth.

## Key constraints to preserve when continuing the rewrite

- Site copy comes from `design-reference/design_handoff_kargatox/content/Website-content.pdf` verbatim —
  don't paraphrase.
- Treat anything under `legacy-nextjs-app/` as read-only reference, not a place to make fixes — it's
  frozen. If a bug is ported along with the logic it came from, fix it in the new `lib/`/`routes/`/`views`
  files, not in the legacy copy.
- The prototype/legacy **data** (dashboard numbers, sample enquiries, team names, "SAMPLE DATA" panels on
  Services) is placeholder and must not be treated as real content.
- When a later phase re-adds role permissions, server-side rate limiting, or the honeypot spam check,
  check `legacy-nextjs-app/` for the already-reviewed implementation (`requireEnquiryAccess()`,
  `src/lib/rate-limit.ts`, the `company`-field honeypot naming note in that app's contact form) before
  re-designing it from scratch — most of this logic was already debugged once.
- Animations must respect `prefers-reduced-motion: reduce` — `public/css/input.css` already disables the
  CSS-keyframe ones, and `public/js/site.js` has its own `prefersReducedMotion()` helper (a plain
  `matchMedia` check) that `initScrambleReveal()` already uses to skip straight to the final text. Reuse
  that same helper for any new JS-driven animation (e.g. the still-unwired `numbered-rows.ejs` grow-in)
  instead of writing a second one.
