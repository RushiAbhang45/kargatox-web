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
site's deploy target changed to a prerendered static build (commit `775b6fd`, not itself phase-numbered —
see "Static prerender / Vercel deploy" in Architecture below). The remaining phases are tracked only as
inline code comments (grep for `Phase \d`), not a separate plan doc:
- **Phase 2** — wire a database back in; swap the hardcoded `PAGE_DEFAULTS`/`FAQ_DEFAULTS`/sub-service
  content in `routes/site.js` for a real DB-backed merge (the "default until a row exists" pattern the
  legacy app used). Note this would also need to feed the static-prerender script (see Architecture) or
  that script's output goes stale against the DB.
- **Phase 3** — `POST /api/enquiries`: real submit handling for the Contact form, including the
  honeypot/prefill logic currently only sketched as static markup in `views/site/contact.ejs`. Move
  `SERVICE_OPTIONS` (currently inlined in that template) into a shared `lib/enquiry-schema.js` once this
  lands, so the API route and the `<select>` read from one place.
- **Phase 8** — blog & case studies rendering (`views/site/blog-list.ejs` / `blog-post.ejs` are placeholder
  routes today).
- **Phase 10 (mostly done, one piece left)** — `public/js/site.js` wires the mobile nav drawer toggle
  (`site-header.ejs`'s `#mobile-menu-toggle`/`#mobile-menu`), the FAQ accordion's click-to-toggle
  (`faq-accordion.ejs`'s `data-faq-trigger`/`data-faq-panel` hooks), and the scramble-text effect
  (`data-scramble-reveal` attributes). **Not done:** `numbered-rows.ejs`'s grow-in underline animation —
  its own header comment still says the underline "renders at its final (fully grown) width" and the
  grow-in itself remains unbuilt; don't assume it's covered by the rest of Phase 10 landing.
- Phases 4–7 and 9 (auth/admin, revenue-check API, admin panels, team/settings, SEO) aren't ported yet and
  have no phase-numbered comments pointing at them — treat the legacy app's equivalent sections as the
  spec when that work starts, the same way Phase 1–3/8/10 above do.

Don't assume feature parity with `legacy-nextjs-app/` just because this is "the current app" — anything
not listed as done above (DB content, the enquiries API, revenue-check quiz, admin panel, auth, blog
rendering, the one remaining animation) simply isn't built yet in this rewrite.

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
- `npm run build` — runs `build:css` then `build:static`; this is the full build step before a deploy.
- No lint script and no test suite in this rewrite (the legacy app had both; neither has been re-added here).
- No `.env` is required for Phase 1 — the app has no DB/SMTP/auth wiring yet. The committed `.env.example`
  still documents the legacy app's Postgres/Auth.js/SMTP variables; those are **not consumed by anything in
  this rewrite today** and only become relevant again once Phase 2+ reintroduces that wiring (check
  `server.js`/`routes/` for actual `process.env` reads before assuming an env var does anything).

## Architecture

- **`server.js`** is the entire app bootstrap: creates the Express app, sets `view engine`/`views` to
  `ejs`/`./views`, serves `./public` as static, and mounts `routes/site.js` at `/`. It exports the `app`
  (for a future serverless target) and only calls `.listen()` when `process.env.VERCEL` isn't set.
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
- **No admin panel, no auth, no database, no email** exist in this rewrite yet — don't reach for
  Prisma/Auth.js/nodemailer patterns from `legacy-nextjs-app/` as if they apply here; they're the target to
  port *to*, in later phases, not current dependencies. (Client-side JS does now exist — `public/js/site.js`,
  see Phase 10 above and the prerender bullet below.)
- **Static prerender / Vercel deploy (`scripts/build-static.js`, `vercel.json`, committed `public/*.html`)**
  — added after Phase 10 (commit `775b6fd`), this is the actual deploy mechanism and is easy to miss since
  it's not phase-numbered. `vercel.json` sets `"outputDirectory": "public"` and `"cleanUrls": true`, so
  Vercel serves the committed static files directly — **the Express app (`server.js`) is not run in
  production**; it's only used locally (`npm run dev`) and as the HTTP source `build-static.js` scrapes at
  build time. This means **every route/content/template change needs `npm run build` (or at least
  `build:static`) re-run and its `public/*.html` diff committed**, or production keeps serving the old
  render — there is no server-side rendering in the deployed site despite `routes/site.js`/`views/` using
  `res.render()`. `scripts/build-static.js`'s `ROUTES` array is a hardcoded list derived from `NAV_LINKS` +
  `SERVICE_PAGES`; a new route added to `routes/site.js` also needs an entry there or it won't get
  prerendered. `/blog/:slug` is deliberately excluded (no real posts exist pre-Phase-8).

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
