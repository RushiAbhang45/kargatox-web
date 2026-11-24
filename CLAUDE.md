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
CLI pipeline, and all 11 original public page templates (home, services, how-we-work, faq, contact, the 6
service-landing pages via one shared template, plus placeholder blog routes) rendering hardcoded content,
no database. Phase 10 is also mostly done (commit `afdb1c0`, see `public/js/site.js`). Since then, several
things landed outside the phase numbering: a 12th public page (`/about-us`, commit `ba5d63d`, no legacy
equivalent) plus a real SEO/JSON-LD layer (`lib/seo-data.js`, same commit — see Architecture); a
from-scratch admin panel (commits `5a6b9d0` then `a9b179b`, then the DB-wiring/email pass below — see
"Admin panel, auth, and database", which is now feature-complete); and a **2026-11-14 SEO content pass**
(no dedicated commit yet — delivered as a batch of prerendered `public/*.html` output that had to be
reverse-engineered back into `lib/`/`views/`/`routes/site.js`, since the live app never reads `public/`
for a routed path): a 13th public page (`/clients` — `lib/clients-data.js`, `views/site/clients.ejs`, no
legacy or design-handoff equivalent either), richer JSON-LD/meta on every page (`lib/seo-data.js`'s
`ORGANIZATION`/`pageEntry()`/`serviceSchema()` — alternateName, geo/hasMap, areaServed as City/State/
Country, knowsAbout, speakable, primaryImageOfPage, a fixed `dateModified`/`og:updated_time` of
`CONTENT_UPDATED_DATE`), new hreflang/geo/business-contact `doc-head.ejs` meta tags, a few revised page
titles/descriptions (`routes/site.js`, `lib/service-pages-data.js`'s `metaDescription` fields), and a new
sitewide "Our Location" embedded-map block in `site-footer.ejs`. Site body copy otherwise did **not**
change in this pass — don't assume a future `public/*.html` upload is low-risk to diff away without
checking; this one happened to be meta/schema-only plus one new page, not a rewrite of existing pages'
content. The site's deploy target also briefly changed to a prerendered static build (commit `775b6fd`),
then changed back to a live Node function (commit `dcdc668`) once the admin panel needed real server-side
DB/session handling — see "Deploy target: live Node function on Vercel" in Architecture below; don't trust
the static-prerender framing as current. The remaining phases are tracked only as inline code comments
(grep for `Phase \d`), not a separate plan doc:
- **Phase 2 — done.** `routes/site.js`'s five page handlers (`/`, `/services`, `/how-we-work`, `/faq`,
  `/contact`) and `/services`'/`/faq`'s sub-service/FAQ content all read real DB rows now
  (`PageContent`/`SubService`/`FaqItem`), merged over the hardcoded `lib/*-defaults.js` fallback via
  `mergePublishedPage()`/`faqItemsFromRows()`/`subServicesByKeyFromRows()` — the same "default until a row
  exists" helpers the admin Pages and Services & FAQ editors use (and were extracted from). Publishing in
  the admin now has a real, visible effect on the live public pages.
- **Phase 3 — done.** `routes/api.js`'s `POST /api/enquiries` is the Contact form's real submit handler —
  mirrors the already-reviewed `legacy-nextjs-app/src/app/api/enquiries/route.ts`: a per-IP rate limit
  (`lib/rate-limit.js`, 5 requests / 10 min), a honeypot short-circuit (a filled `company` JSON field —
  unrelated to the real `Enquiry.company` DB column — returns a fake `201` without saving or emailing
  anything), field validation (`lib/enquiry-schema.js`'s `validateEnquiry()`, the zod-free equivalent of the
  legacy app's `enquirySchema`; `SERVICE_OPTIONS` now lives here instead of being inlined in
  `views/site/contact.ejs`, and `routes/site.js`'s `/contact` handler passes it into the template so the
  route and the `<select>` can't drift apart), and an `Enquiry` row create (`source: "Contact form"`).
  `public/js/contact-form.js` (loaded only by `views/site/contact.ejs`) wires the static form's
  `data-error-for` spans/`#contact-form-error`/honeypot to a `fetch` call against this route, with inline
  field errors and a "Thanks, {firstName}." success state, same shape as the legacy
  `contact-form.tsx` minus the React. `lib/enquiry-mail.js` (ported from the legacy app's
  `src/lib/email.ts`) now gives Settings' `autoReplyMessage`/`sendAutoReply`/`notificationEmail`/
  `alsoNotify` fields their trigger — a real submission sends a team notification and, if enabled, an
  auto-reply, both via `lib/mailer.js`'s `sendMail()` wrapped in its own try/catch (an already-saved
  enquiry never becomes a user-visible failure just because SMTP hiccuped) — verified end-to-end against
  the live DB (honeypot → no row; invalid input → `400` + field errors; valid submission → `201` + a real
  `Enquiry` row, immediately visible in the admin Dashboard/Enquiries). The admin Dashboard and the
  Enquiries/Revenue checks sections (see below) now have real data to show instead of reading as
  zero/empty.
- **Phase 8 — done.** `routes/site.js`'s `GET /blog` / `GET /blog/:slug` read real `Post` rows
  (`status: "PUBLISHED"` only; an unpublished/unknown slug falls through to the 404 handler, same pattern
  the service-slug allowlist uses). `views/site/blog-list.ejs` / `blog-post.ejs` render real listings/posts
  instead of the old "being ported in a later phase" placeholder copy — `post.body` renders as raw HTML
  (`<%- %>`, not escaped), styled by `public/css/input.css`'s `.kx-prose` rules, since it's a plain
  `<textarea>` value, not Tiptap JSON (see `lib/post-schema.js`'s header comment). Publishing a post in the
  admin now makes it live at `/blog` and `/blog/<slug>` immediately.
- **Phase 10 (mostly done, one piece left)** — `public/js/site.js` wires the mobile nav drawer toggle
  (`site-header.ejs`'s `#mobile-menu-toggle`/`#mobile-menu`), the FAQ accordion's click-to-toggle
  (`faq-accordion.ejs`'s `data-faq-trigger`/`data-faq-panel` hooks), and the scramble-text effect
  (`data-scramble-reveal` attributes). **Not done:** `numbered-rows.ejs`'s grow-in underline animation —
  its own header comment still says the underline "renders at its final (fully grown) width" and the
  grow-in itself remains unbuilt; don't assume it's covered by the rest of Phase 10 landing.
- **Phases 4–7/9 — done.** A full admin panel (login, Dashboard, Team, Settings, Enquiries, Revenue
  checks, Pages, Services & FAQ, Blog & case studies — commits `5a6b9d0`, `a9b179b`, and the DB-wiring/
  email pass below) exists with a real Postgres/Prisma DB, its own cookie-based auth, and outbound email,
  now with two real triggers (Enquiries "Send reply", and Phase 3's Contact-form-submission notification/
  auto-reply — see "Admin panel, auth, and database").

Don't assume feature parity with `legacy-nextjs-app/` just because this is "the current app" — anything
not listed as done above (the one remaining animation) simply isn't built yet in this rewrite.

### Client change list 2026-11-02 (branch `client-changes-nov-2026`)

The client's "Changes to be made in Website" PDF, item by item:
1. **Gmail address removed.** The public address is `lib/seo-data.js`'s `CONTACT_EMAIL`
   (`hello@kargatox.com`, also on `app.locals`) — footer, About Us, Clients, Contact, meta and JSON-LD all
   read it. `Kargatox@gmail.com` survives only in comments, as the owner of the Calendly/Clarity accounts.
2. **Services panels** — the legacy "SAMPLE DATA" dashboards are gone; each service in
   `lib/services-data.js` has a `panel` (tag/heading/body/3 stats/sources) with the client's copy.
3. **Footer** is one 4-column grid (brand + address/contact, Company links, Services, map) instead of two
   half-empty rows.
4. **Client logos** — `lib/clients-data.js`'s `CLIENT_LOGOS` + `views/partials/client-logos.ejs`, on
   `/clients` (with captions) and the home page (compact strip). Drop logo files into
   `public/images/clients/<slug>.{svg,png,webp,jpg}`; until then a monogram tile shows. Each client's
   `work` caption is `null` until the client supplies it — don't invent one.
5./8. **Contact form** — see `routes/api.js`'s header comment for the abuse-protection layers (body-size
   limit, per-IP/per-email/per-instance rate limits, honeypot, signed form token `lib/form-token.js` with a
   3s minimum fill time, optional Cloudflare Turnstile, email-domain check `lib/email-check.js`). New
   fields: country code + digits-only phone (`COUNTRY_CODES` in `lib/enquiry-schema.js`, whose
   `normalizeEnquiry()` is now what the route saves), LinkedIn, website, "book a meeting?" yes/no. Selects
   use a custom chevron inside the field (`.kx-select` in `public/css/input.css`). The welcome email
   (`lib/enquiry-mail.js`) is branded HTML whose body is still Settings → Auto-reply message, so the
   client's own welcome copy goes in via the admin panel. A website triggers `lib/site-scan.js` after the
   response (via `@vercel/functions`' `waitUntil`): an SSRF-guarded fetch + deterministic audit, plus a
   Claude write-up when `ANTHROPIC_API_KEY` is set; results show in admin → Enquiries (with Re-scan).
   **Email OTP verification was deliberately not built** — the client asked for it to be discussed first.
6. **Revenue check** — the "being ported in a later phase" placeholder is replaced by the real quiz
   (`views/partials/revenue-check.ejs`, `public/js/revenue-check.js`, `lib/revenue-check-data.js`,
   `POST /api/revenue-checks`), whose "Fix my …" link prefills `/contact?service=&note=&checkId=`.
7. **How we work** — steps 3–5 bodies in `lib/process-steps.js` replaced with the client's copy (lightly
   proofread).
9. (Revised PDF, 2026-11-24) **Shorter Marketing sub-service text** on `/services` — new defaults in
   `lib/services-data.js`; since live text may come from `SubService` rows, migration
   `20261124090000_shorten_marketing_subservices` updates only rows still holding the original long text
   (admin edits are left alone).
10. **"In The Weeds"** (home + About Us) now reads "We sit inside your marketing team, …".

Branding: favicons/app icons are the client's K-arrow mark; the footer shows the header logo recoloured
for the dark background (`public/images/kargatox-logo-footer.{webp,png}`, white lettering, orange kept).

New `Enquiry` columns (`linkedinUrl`, `website`, `wantsMeeting`, `siteAuditStatus`, `siteAudit`,
`siteAuditAt`) are added by `legacy-nextjs-app/prisma/migrations/20261123090000_enquiry_contact_fields/`
(migrations still live there — the only legacy-folder change) and mirrored in both `schema.prisma` files.
**Migrations now apply automatically on every Vercel deploy**: `package.json`'s `vercel-build` script
(`prisma migrate deploy --schema legacy-nextjs-app/prisma/schema.prisma`) is what `@vercel/node` runs before
building the function (it checks `vercel-build`/`now-build`, not `build`). It needs `DATABASE_URL_UNPOOLED`
in Vercel; if the migration fails the deploy fails and the previous version stays live. So any migration
committed to `legacy-nextjs-app/prisma/migrations/` goes to production with the next push — review them
accordingly. Manual equivalent: `npm run vercel-build`.

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
  static output silently drifts from what `npm run dev` renders. Now that `routes/site.js` is DB-backed
  (Phase 2/8), this script needs `DATABASE_URL` to actually get through the prerender — it loads `.env`
  itself (before setting `process.env.VERCEL = "1"`, which would otherwise skip `server.js`'s own
  now-shadowed `dotenv.config()` call), so this still works locally with no extra setup.
- `npm run build` — runs `build:css` then `build:static`. Still worth running after a public-page content/
  template change (see the deploy-target note in Architecture for why this no longer gates production the
  way it used to), but it is **not** the deploy mechanism anymore.
- `postinstall` (`prisma generate`) runs automatically on `npm install` — needed for `@prisma/client` to
  exist at all; there's no `prisma migrate`/`db:seed` script in `package.json` yet (migrations are owned
  by `legacy-nextjs-app/`, which shares this DB — see "Admin panel, auth, and database" below).
- No lint script and no test suite in this rewrite (the legacy app had both; neither has been re-added here).
- Public-site pages still need no `.env` beyond `DATABASE_URL`/`DATABASE_URL_UNPOOLED` now that Phase 2/8
  read the DB (previously the public site needed no `.env` at all). The admin panel also needs
  `AUTH_SECRET` (`lib/admin-auth.js`) — `/admin/login` throws if it's unset. `SMTP_HOST`/`SMTP_PORT`/
  `SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` are now genuinely read by `lib/mailer.js`; if any are missing,
  `sendMail()` just logs and no-ops rather than throwing, so the admin panel still works without them —
  only outbound email silently doesn't happen. `.env.example`'s `db:seed` mention is still **not** consumed
  by anything here (no seed script exists). `ADMIN_NOTIFY_EMAIL` **is** now read (Phase 3,
  `lib/enquiry-mail.js`) as the fallback "new enquiry" notification recipient when Settings'
  `notificationEmail` is unset — check `server.js`/`routes/`/`lib/` for actual `process.env` reads before
  assuming any given env var does something in this app.

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
  `SERVICE_PAGES`/`SERVICE_PAGE_GROUPS`/`SUB_SERVICE_HREFS`, and `PROCESS_STEPS` are all attached to
  `app.locals` in `server.js` and read by name directly in partials (e.g. `site-header.ejs` references
  `NAV_LINKS`, `SERVICE_PAGE_GROUPS`, `SERVICE_PAGES` with no `include(...)` argument passing them in).
  Anything that's per-request or page-specific instead comes in as a `res.render()` locals object from the
  route handler — that split (locals-for-shared vs. render-args-for-per-page) is the pattern to follow for
  new data. `SERVICES` (`lib/services-data.js`) used to be on `app.locals` too, but Phase 2 made
  `services.ejs`'s rendering of it per-request (each service's `items` now depends on `SubService` DB
  rows) — it's gone from `app.locals` and is `require()`'d directly by `routes/site.js`/`routes/admin.js`
  instead, matching how `routes/admin.js` already consumed it before this change.
- **`routes/site.js`** is a single router: one (now `async`) `GET` handler per public page, a
  `Set`-checked `GET /:slug` for the six service-landing pages (explicit slug allowlist, not a catch-all —
  an unknown path falls through to the final 404 handler in `server.js` instead of rendering with
  undefined content), and `GET /blog` / `GET /blog/:slug` reading real `Post` rows (Phase 8 — an
  unpublished/unknown slug also falls through to the 404 handler via the same `next()` pattern). Each
  handler does any server-side content shaping (e.g. `splitFirstSentence`/`splitLastWord` from
  `lib/text-split.js`, or the Phase 2 DB merge below) before calling `res.render()` — views stay free of
  that logic. Express 5 (the version in use) auto-forwards a rejected async handler's promise to the
  default error handler, so there's no manual try/catch scaffolding around the `await prisma.*` calls here
  — matches the pattern `routes/admin.js`'s async handlers already relied on.
- **`routes/api.js`** (Phase 3) is the public, unauthenticated JSON API — currently just
  `POST /enquiries`, mounted at `/api` in `server.js` between `/admin` and `/` (alongside
  `app.use(express.json())`, added for this, next to the pre-existing `express.urlencoded()`). Separate
  router from `routes/site.js` on purpose: it returns JSON error bodies (`{ error, fieldErrors? }`), not
  rendered pages, so it shouldn't share `routes/site.js`'s 404-via-`next()` conventions.
- **`lib/*.js`** holds plain CommonJS modules, mostly ported from the legacy app's `src/lib/*.ts` — same
  data, same shape, no TypeScript/zod: `page-content-defaults.js` (`PAGE_DEFAULTS`, the hardcoded fallback
  copy per page, `PAGE_KEYS`/`PAGE_LABELS`/`PAGE_ROUTES`/`PAGE_FIELDS` which drive the admin Pages editor,
  and `mergePublishedPage(pageKey, row)` — the shared "default until a row exists" merge used by both the
  admin Pages editor and `routes/site.js`, Phase 2), `faq-defaults.js` (`FAQ_DEFAULTS` plus
  `faqItemsFromRows(faqRows)`, the same merge pattern for `FaqItem` rows, shared by the admin Services &
  FAQ editor and the public `/faq` page), `nav-links.js` (now includes the non-legacy `/about-us` and
  `/clients` entries — both `site-header.ejs`'s desktop/mobile nav and `site-footer.ejs`'s link list read
  this one array, so adding a plain (non-dropdown) page here is a one-line change),
  `process-steps.js`, `services-data.js` (`SERVICES`, the Services page's non-editable "SAMPLE DATA"
  dashboard panel content, plus `subServicesByKeyFromRows(subServiceRows)` — same merge pattern, grouping
  `SubService` rows by `serviceKey` with a fallback to each service's hardcoded `items`), `service-pages-data.js`
  (all six service-landing pages' copy/FAQs/related-links, sourced word-for-word from the client's
  "Kargatox – SEO Content for 6 Service update" doc), `enquiry-status.js` and `post-schema.js` (status/type
  enums + validation for Enquiries and Blog in the admin panel — `post-schema.js` swaps the legacy app's
  zod schema for a plain `validatePost()` function), `mailer.js` (ported from `legacy-nextjs-app/src/lib/mailer.ts`
  verbatim — lazy `nodemailer` transporter from `SMTP_*` env vars, `sendMail({to,subject,text})` logs and
  no-ops instead of throwing if they're unset), `text-split.js` (`splitFirstSentence`/`splitLastWord`,
  the two-tone-heading helpers), and four Phase-3 modules backing `routes/api.js`: `enquiry-schema.js`
  (`SERVICE_OPTIONS` — also read by `routes/site.js`'s `/contact` handler for the `<select>` — plus
  `validateEnquiry()`, the zod-free equivalent of the legacy app's `enquirySchema`), `rate-limit.js`
  (`rateLimit(key, limit, windowMs)`, ported from `src/lib/rate-limit.ts` verbatim — in-memory per-instance
  buckets, fine for a single small deploy but not a multi-instance one), `settings.js` (`SETTINGS_ID`/
  `SETTINGS_DEFAULTS`/`getSettings()`, ported from `src/lib/settings.ts` — note `routes/admin.js`'s
  Settings section still keeps its own copy of `SETTINGS_ID`/the defaults object inline rather than
  importing this, a small pre-existing duplication this pass didn't touch), and `enquiry-mail.js`
  (`sendEnquiryEmails()`, ported from `src/lib/email.ts` — builds the team-notification and auto-reply
  emails and sends both via `mailer.js`'s `sendMail()`). Each ported file's header comment names its
  `legacy-nextjs-app/src/lib/*.ts` source — check that file first if behavior looks wrong, since it's the
  originally-reviewed version.
  `seo-data.js` and `clients-data.js` have no legacy equivalent — `clients-data.js` (2026-11-14 SEO content
  pass) holds the `/clients` page's content (`STATS`/`SEO_CASE_STUDY`/`ERP_CASE_STUDY`/`AUTHOR`/`ARTICLES`),
  reverse-engineered from the client's uploaded static build with no design-handoff source to check it
  against — treat it as the first-draft source of truth for that page, not an already-reviewed port.
  `seo-data.js` is a new module (commit `ba5d63d`, enriched further in the 2026-11-14 pass) holding
  JSON-LD building blocks (`ORGANIZATION`, `WEBSITE`, `seo.graph()`, `seo.breadcrumb()`,
  `seo.serviceSchema()`, `seo.pageEntry()` — the last two now also bake in `audience`/`areaServed` and
  `primaryImageOfPage`/`dateModified`/`speakable`/a default `mainEntity` respectively, so callers only
  override `mainEntity` when they need something other than the organization — and `seo.faqSchema(path,
  faqs, { nested, name, description })`: `nested: true` emits a standalone `#faq` entry alongside the
  page's own separate `WebPage`/`seo.serviceSchema()` entry (the 6 service-landing pages, which have FAQs
  but aren't primarily an FAQ page); `nested: false` makes the `FAQPage` entry itself the page's full
  `#webpage` entry via `pageEntry()` (`/faq`, which has no separate `WebPage` entry of its own)) and plain
  constants
  (`SITE_URL`, `GA_MEASUREMENT_ID`, `GOOGLE_SITE_VERIFICATION`, `LOGO_URL`, `GEO_LATITUDE`/`GEO_LONGITUDE`,
  `CONTENT_UPDATED_DATE`) sourced from the client's SEO upload; `routes/site.js` handlers build a per-page
  `meta` object (title/description/path/`jsonLd`) from it and pass it to `res.render()`, consumed by
  `views/partials/doc-head.ejs`, while the plain constants are also exposed directly on `app.locals` for
  `doc-head.ejs`/`site-footer.ejs` to read without the `meta` indirection.
- **Microsoft Clarity + Calendly (both tied to the `Kargatox@gmail.com` account) — both real now.**
  `lib/seo-data.js`'s `CLARITY_PROJECT_ID` is `zddpq7gv8o` (the "Kargatox Knowledge Partners" project
  at clarity.microsoft.com); `CALENDLY_URL` is `https://calendly.com/kargatox`, the account's general
  scheduling link rather than one event type's URL — correct today (one event type, "30 Minute
  Meeting") and stays correct if more get added. `doc-head.ejs` loads the Clarity tracking snippet and
  Calendly's `widget.js`/`widget.css` sitewide (same unconditional pattern as `GA_MEASUREMENT_ID` — a
  bad Clarity ID just records nothing, it doesn't throw). `site-footer.ejs`'s shared CTA banner (every
  page except Contact,
  which has its own) has a third "Book a call" button calling `Calendly.initPopupWidget()`, falling
  back to a plain link if the async widget script hasn't loaded yet. `contact.ejs` additionally has a
  "PREFER A CALL?" quick link next to "PREFER EMAIL?" and a full `calendly-inline-widget` embed
  section below the contact form.
- **EJS view conventions** (`views/site/*.ejs` = full pages, `views/partials/*.ejs` = includable
  fragments):
  - Every page/partial opens with a comment naming its `legacy-nextjs-app/src/.../*.tsx` source and listing
    what locals it expects — read that comment before editing, it's the prop contract.
  - Partials take "props" as the object literal passed to `include('partial-name', { ... })`; optional
    props are read defensively with `typeof x !== "undefined" ? x : default` since EJS doesn't error on a
    missing local the way a TS component would on a missing prop (see `logo.ejs`'s `variant`/`className`,
    `numbered-rows.ejs`'s `className`, `site-footer.ejs`'s `showCta`/`ctaTopPadding` — the latter added in
    the 2026-11-14 pass so About Us and Clients can add `pt-[80px]` to the shared CTA section without
    forcing it on every other page, since those two pages' last section ends flush with no bottom padding
    of its own).
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
  - Below the `@theme inline` block, a handful of hand-rolled component classes exist for markup that
    doesn't fit Tailwind's utility syntax (not run through a plugin like `@tailwindcss/typography`):
    `.kx-grid`/`.kx-list`/`.kx-contact` for `views/site/about-us.ejs`, and `.kx-prose` for rendering a
    blog/case-study post's HTML `body` (`views/site/blog-post.ejs`, Phase 8) — targets the plain tags an
    admin is actually likely to type (`h2`/`h3`/`a`/`ul`/`ol`/`blockquote`/`strong`), not a general-purpose
    typography reset.
- **Admin panel, auth, and database exist, and the admin panel is feature-complete** — see the dedicated
  section below. Prisma/bcryptjs/nodemailer are real dependencies now (`package.json`), not legacy-only
  patterns to avoid. Auth.js itself was not ported (replaced by `lib/admin-auth.js`'s own cookie session).
  The Contact form (Phase 3, `routes/api.js`) now creates real `Enquiry` rows from the public side too —
  the revenue-check quiz is the one thing left that doesn't — see that section for the full rundown.
- **Deploy target: live Node function on Vercel, not the static build.** `vercel.json` now uses the
  explicit v2 `builds`/`routes` form — `@vercel/node` on `server.js`, every path routed to it (commit
  `dcdc668`) — after briefly trying (and reverting, commits `43575cd`/`5bbcf58`) a hybrid multi-build
  config and, before that, a pure static deploy (`"outputDirectory": "public"`, commit `775b6fd`). The
  live Node function was necessary once the admin panel needed real per-request DB reads and signed-cookie
  session checks, which a static prerender can't do. `scripts/build-static.js`'s header comment has been
  corrected to match this — trust `vercel.json` over any older framing you find elsewhere (e.g. in
  `.env.example` or other comments not touched by this note). In production, `server.js` behaves exactly
  like it does locally: its live EJS routers are mounted before `express.static`, so the committed
  `public/*.html` files (still regenerated by `npm run build:static`) are shadowed by the live render for
  every path that has a real route, and now only actually serve as `express.static` fallback content for
  paths with no matching route. Keep running `npm run build:css` after Tailwind/token changes regardless —
  `styles.css` is a static asset nothing rebuilds automatically on deploy. `scripts/build-static.js`'s
  `ROUTES` array is a hardcoded list derived from `NAV_LINKS` + `SERVICE_PAGES`; a new route added to
  `routes/site.js` also needs an entry there or it won't get prerendered. `/blog/:slug` is still
  deliberately excluded even after Phase 8 — individual post slugs are DB content, not a fixed list, and
  since this static output is only a fallback (not the deploy mechanism), scanning the DB for every
  published slug at build time wasn't judged worth the added complexity; `/blog`'s list page is prerendered
  as a snapshot of whatever's published at build time.

## Admin panel, auth, and database

A full admin panel exists, built directly into this app (`routes/admin.js`, `views/admin/*.ejs`,
`views/partials/admin-sidebar.ejs`, commits `5a6b9d0` then `a9b179b`) — **not** ported from
`legacy-nextjs-app/`, unlike everything else in this rewrite (each section instead uses the equivalent
already-reviewed legacy `page.tsx`/`actions.ts` as its spec, named in `routes/admin.js`'s section comments).
`server.js` mounts it at `/admin` before `routes/site.js`, so admin routes always take precedence over the
public router and over `express.static`. Every sidebar link (`/admin/enquiries`, `/admin/revenue-checks`,
`/admin/pages`, `/admin/services-faq`, `/admin/blog`, plus Team/Settings) now has a real route — there are
no more placeholder 404s in the admin panel itself.

- **Database**: `prisma/schema.prisma` is a real data model (`User`, `Enquiry`, `RevenueCheck`,
  `EnquiryMessage`, `PageContent`, `SubService`, `FaqItem`, `Post`, `Settings`) describing a Postgres DB
  *shared* with `legacy-nextjs-app/prisma/schema.prisma` — this app only ever reads/writes rows; migrations
  are owned by the legacy app (there's no `prisma migrate`/`db:seed` script here, despite `.env.example`
  mentioning `npm run db:seed` — that script doesn't exist yet). `lib/db.js` exports a `PrismaClient`
  singleton cached on `global` so warm serverless invocations reuse one connection pool instead of opening
  a new one per request.
- **Auth**: `lib/admin-auth.js` is a stateless, signed-cookie session (`kx_admin_session`, HMAC-SHA256 over
  `AUTH_SECRET`, 30-day expiry, `HttpOnly`/`SameSite=Lax`/`Secure`-when-on-Vercel) — deliberately *not*
  Auth.js, even though it reads/writes the same `User` table the legacy app's Auth.js adapter used. Being
  stateless means there's no server-side revocation: `requireAuth` only verifies the cookie's signature and
  expiry, it never re-checks the `User` row, so removing someone in Team (or changing their role) doesn't
  invalidate a session they're already holding — confirmed by testing (a cookie for a just-deleted user
  still authenticated) — it just expires naturally after 30 days. This is the cost of the stateless design,
  not a bug to silently patch; if immediate revocation matters, that needs a deliberate follow-up (a
  session table/blacklist, or re-deriving role from a fresh DB read per request) — a real architecture
  change, not a fix folded into this pass.
- **Role gating**: `routes/admin.js` defines four role groups as plain arrays (same role set as
  `legacy-nextjs-app/src/lib/roles.ts`: `TEAM_ACCESS_ROLES`/`SETTINGS_ACCESS_ROLES` = `OWNER`/`ADMIN`,
  `ENQUIRY_ACCESS_ROLES` = `OWNER`/`ADMIN`/`SALES`, `CONTENT_ACCESS_ROLES` = `OWNER`/`ADMIN`/`EDITOR`) and a
  `requireRole(roles, title)` factory that both `requireTeamAccess`/`requireSettingsAccess` and the newer
  `requireEnquiryAccess`/`requireContentAccess` are built from. A role mismatch renders the normal sidebar
  layout with an inline message (`views/admin/forbidden.ejs`, HTTP 403) rather than a dead-end page — the
  same UX the legacy app used. `requireAuth` (session presence) always runs first.
- **Dashboard** (`GET /admin`) reads real `Enquiry` rows for 30-day/total counts and a 12-week chart —
  populated now that Phase 3's `POST /api/enquiries` is the real public-facing source of those rows.
- **Team** (seat-limited to `MAX_TEAM_SEATS = 5`) mirrors the already-reviewed "admin sets the password
  directly" flow from `legacy-nextjs-app/src/app/admin/(protected)/team/actions.ts`.
- **Settings** is a `Settings` singleton row for site name/notification email/auto-reply message/GA
  measurement id. Saves correctly, but `doc-head.ejs`'s GA snippet still reads the hardcoded
  `lib/seo-data.js` constant rather than this row's `gaMeasurementId`/`gaEnabled` — that part is still not
  wired up. The auto-reply/notification fields (`autoReplyMessage`/`sendAutoReply`/`notificationEmail`/
  `alsoNotify`) **do** have a real trigger now — Phase 3's `lib/enquiry-mail.js`, fired from
  `routes/api.js`'s `POST /enquiries` on every real Contact form submission.
- **Enquiries** (`GET /admin/enquiries`, mirrors legacy's `enquiries/{page.tsx,actions.ts}`): list with
  status filter + counts, a detail panel (`?id=`) for pipeline status / assignment / replying. Replying
  (`POST /admin/enquiries/:id/reply`) writes an `EnquiryMessage` row, bumps `NEW`→`CONTACTED`, and sends the
  reply by email via `lib/mailer.js` (`sendMail()` wrapped in its own try/catch — a flaky SMTP connection
  never turns an already-saved reply into a user-visible failure, same ordering as the already-reviewed
  legacy `sendReply()`). Verified against the live DB and a real Gmail SMTP send.
- **Revenue checks** (`GET /admin/revenue-checks`) is read-only — stats + table over `RevenueCheck` rows;
  there's no `actions.ts` equivalent because there's nothing to mutate, mirroring the legacy page.
- **Pages** (`GET /admin/pages`, mirrors legacy's `pages/{page.tsx,actions.ts}`): a draft/publish editor
  over `PageContent` rows, using `PAGE_KEYS`/`PAGE_LABELS`/`PAGE_ROUTES`/`PAGE_FIELDS` from
  `lib/page-content-defaults.js`. **Publishing here now changes the live public page** (Phase 2,
  `routes/site.js` reads the same `PageContent.published` JSON via `mergePublishedPage()`) — verified
  end-to-end against the live DB (publish → page changes; draft alone → page doesn't).
- **Services & FAQ** (`GET`/`POST /admin/services-faq`, mirrors legacy's
  `services-faq/{page.tsx,actions.ts}`): one combined editor/save across all services' `SubService` rows
  and the global `FaqItem` list. Falls back to `lib/services-data.js` / `lib/faq-defaults.js` content until
  rows exist (same "default until edited" pattern as Pages, now shared via `subServicesByKeyFromRows()`/
  `faqItemsFromRows()` with `routes/site.js`'s `/services`/`/faq`). Save does a full delete+recreate per
  `serviceKey` (and for `FaqItem` globally) using Prisma's **array-form (batch) `$transaction`**, not the
  interactive/callback form — the callback form reliably hit Prisma error `P2028` ("Unable to start a
  transaction in the given time") over Neon's pooled connection (`DATABASE_URL`, pgbouncer); the batched
  form was verified to work. If a future change needs an interactive transaction against this DB, expect
  the same issue and prefer the array form again.
- **Blog & case studies** (`GET/POST /admin/blog`, `/admin/blog/new`, `/admin/blog/:id`,
  `/admin/blog/:id/delete`, mirrors legacy's `blog/{page.tsx,[id]/page.tsx,new/page.tsx,actions.ts}`): list
  + new/edit editor + delete over `Post` rows (type `BLOG`/`CASE_STUDY`, status `DRAFT`/`PUBLISHED`).
  `body` is a plain HTML/text `<textarea>`, **not** the legacy app's Tiptap JSON — there's no rich-text
  editor dependency in this app, and this is a deliberate scope cut (see `lib/post-schema.js`'s header
  comment), not an oversight. **Publishing now makes the post live** at `/blog` and `/blog/<slug>` (Phase
  8) — verified end-to-end (publish → appears on both; delete → 404s again, same `next()` fallthrough the
  service-slug allowlist uses).
- **`public/js/admin.js`** is admin-only client JS (separate from `public/js/site.js`/Phase 10, same
  build-free `<script defer>` pattern) — a generic repeater (reorder/add/remove rows without a page reload)
  used by Services & FAQ's and Blog's editors, plus the Blog editor's slug-autofill-from-title and live
  search-result preview.
- **Email**: `lib/mailer.js` (ported from `legacy-nextjs-app/src/lib/mailer.ts`) now has two real callers:
  Enquiries' reply action, and (Phase 3) `lib/enquiry-mail.js`'s `sendEnquiryEmails()`, called from
  `routes/api.js` on every real Contact form submission. Settings' `sendAutoReply`/`autoReplyMessage`/
  `notificationEmail`/`alsoNotify` fields now have that real trigger: a team notification always sends
  (if a recipient is configured), and an auto-reply to the enquirer sends additionally when
  `sendAutoReply` is on. `ADMIN_NOTIFY_EMAIL` is the fallback notification recipient when
  `notificationEmail` is unset.
- Required env for any of this to work locally: `DATABASE_URL`/`DATABASE_URL_UNPOOLED` (now needed by the
  public site too, since Phase 2/8 — see the Commands section) and `AUTH_SECRET` for anything under
  `/admin` (see `.env.example`). `SMTP_*` is optional — without it, `lib/mailer.js` just logs instead of
  sending, it doesn't block anything from working.

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
  and governs the content already ported into `lib/*.js`. **Exception:** `/clients` (`lib/clients-data.js`)
  and blog posts (DB `Post` rows) postdate this PDF and have no entry in it — their content came from the
  2026-11-14 upload and the admin Blog editor respectively, not this file.
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
- Admin-side role permissions are already ported (`routes/admin.js`'s `requireRole()`/role-array pattern,
  see "Admin panel, auth, and database"). The public Contact form's submit API (Phase 3, `routes/api.js`)
  already has server-side rate limiting (`lib/rate-limit.js`) and the honeypot spam check — both ported
  from `legacy-nextjs-app/src/lib/rate-limit.ts` and that app's contact form's `company`-field honeypot
  naming convention respectively; check those source files first if either needs changing.
- Animations must respect `prefers-reduced-motion: reduce` — `public/css/input.css` already disables the
  CSS-keyframe ones, and `public/js/site.js` has its own `prefersReducedMotion()` helper (a plain
  `matchMedia` check) that `initScrambleReveal()` already uses to skip straight to the final text. Reuse
  that same helper for any new JS-driven animation (e.g. the still-unwired `numbered-rows.ejs` grow-in)
  instead of writing a second one.
