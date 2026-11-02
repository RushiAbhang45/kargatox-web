# Handoff: Kargatox marketing website + admin panel

## Overview
A multi-page marketing website for **Kargatox** (strategy, research and growth marketing for founders across India) and an **admin panel** for a small team (2–5 people). The admin panel manages everything the site produces or shows: enquiries, revenue-check results, page copy, services, FAQ, blog/case studies, team, and settings.

## About the design files
The files in `designs/` are **design references built in HTML**. They are prototypes that show the intended look and behaviour. They are **not** production code to copy. Rebuild them in a real stack using its normal patterns.

- To view them, open any `designs/*.dc.html` file in a browser. `support.js` must sit in the same folder.
- Each file holds the template markup (inline styles) plus a `class Component` with its logic and sample data. Read both.
- `content/Website-content.pdf` is the client's source copy. Site copy is taken from it word for word; keep it that way.

### Recommended stack (no codebase exists yet)
- **Next.js 14+ (App Router) + TypeScript + Tailwind CSS**, deployed on Vercel.
- **Database:** PostgreSQL (Supabase or Neon) with **Prisma**.
- **Auth:** Auth.js (NextAuth) using email magic links, with role-based access control.
- **Email:** Resend (or SMTP) for enquiry notifications, auto-replies and replies sent from the admin panel.
- **Animation:** Framer Motion, or keep the plain Web Animations API approach from the prototype (see Animations).
- **Content:** page copy, services, FAQ and posts are stored in the database and edited in the admin panel. Public pages read them at build time with ISR revalidation when content is published.

Suggested routes:
```
/                 Home
/services         Services
/how-we-work      Process
/faq              FAQ
/contact          Contact (accepts ?service=&note=)
/blog, /blog/[slug]   Blog and case studies (public list and detail; not designed yet, follow the site style)
/admin            Dashboard
/admin/enquiries, /admin/enquiries/[id]
/admin/revenue-checks
/admin/pages/[page]
/admin/content    (Services & FAQ)
/admin/posts, /admin/posts/[id]
/admin/team
/admin/settings/{general,seo,integrations}
/api/enquiries    POST (public form), GET/PATCH (admin)
/api/revenue-checks   POST (public), GET (admin)
```

## Fidelity
**High fidelity.** Colours, type, spacing, copy and interactions are final. Rebuild them pixel-accurately. The **data** is placeholder: dashboard numbers, sample enquiries, team names, and the "Sample data" dashboard panels on the Services page.

---

## Design tokens

### Colours
| Token | Hex | Use |
|---|---|---|
| navy-900 | `#0b1430` | Dark sections, header, footer, admin sidebar, primary dark button |
| navy-800 | `#0e1a3d` | Cards on dark backgrounds |
| navy-700 | `#16244f` | Dark button hover |
| orange-500 | `#f26a1b` | Primary accent, primary CTA, logo square |
| orange-400 | `#ff8a3d` | Orange hover; accent text on navy |
| blue-500 | `#2f6cf0` | Secondary accent, logo square, focus borders |
| blue-600 | `#1f5fd6` | Eyebrow labels on light backgrounds, links |
| blue-700 | `#1f4fc4` | Circle in the CTA band; chip text |
| blue-300 | `#6f9bff` | Blue text on navy |
| paper | `#f7f6f3` | Site light background |
| ink | `#141a2b` | Body text on light backgrounds |
| slate | `#4a5370` | Secondary text on light backgrounds |
| mist | `#c9d2ea` / `#aeb9d8` | Secondary text on navy |
| line | `#e6e3dc` / `#dcd8cf` | Borders and dividers on light backgrounds |
| chip | `#eceae4`, `#f1f3f9`, `#e8eefc` | Neutral, cool and blue chip backgrounds |
| success | `#4fd1a5` (on dark), `#1f9d63` (on light) | Positive deltas, "Won" |

Status colours (admin): New `#2f6cf0` · Contacted `#8b5cf6` · Proposal `#f26a1b` · Won `#1f9d63` · Lost `#8a93a8`. Status pills use the status colour as text on the same colour at about 13% opacity (hex + `22`).

Admin themes:
- **Light:** bg `#f5f4f0`, panel `#ffffff`, panel2 `#f9f8f5`, border `#e6e3dc`, text `#141a2b`, muted `#5a6380`, soft `#eeece6`.
- **Dark:** bg `#0a1026`, panel `#111a38`, panel2 `#0d1531`, border `rgba(255,255,255,.09)`, text `#eef1f8`, muted `#9aa6c7`, soft `rgba(255,255,255,.06)`.
- The sidebar is always navy `#0b1430`. In dark mode the active filter chip is `#2f6cf0`.

### Typography
- **Display:** Clash Display (Fontshare), weights 500, 600 and 700. Headings are always 600.
- **Body:** Satoshi (Fontshare), weights 400, 500 and 700.
- **Mono:** JetBrains Mono 500 (Google Fonts), used for eyebrows, numbers, tags and dates. Eyebrows use letter-spacing .08–.14em, uppercase, 11–13px.
- Load each Fontshare family with a **separate** `<link>`; the combined URL fails to register the second family. Self-host them with `next/font/local` in production.
- Alternative pairs tested (the Home tweak lets you switch): Cabinet Grotesk + General Sans, or Bricolage Grotesque + Figtree.

Scale (fluid with `clamp`):
- Home H1 `clamp(44px, 7.4vw, 104px)` / line-height .98 / letter-spacing -.02em
- Page H1 `clamp(40–44px, 5–6vw, 68–88px)`
- Section H2 `clamp(36px, 4.6vw, 64px)` / line-height 1.02 / letter-spacing -.03em
- Card H3 22–34px
- Body 16–19px / line-height 1.55–1.65
- Small text 13–15px

### Spacing, radius and shadows
- Container max-width **1240px**, side padding 24px. Section vertical padding 100–120px.
- Grid gaps: 14–20px between cards; 40–80px between columns.
- Radius:
  - pill 999px
  - cards 16–24px
  - large panels 28–32px
  - inputs 10–14px
  - small chips 5–8px
- Shadows: Services dashboard panel only, `0 30px 60px -30px rgba(11,20,48,.5)`; admin toast `0 20px 40px -20px rgba(0,0,0,.5)`.
- Layout pattern: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr))` for two-column blocks that stack on mobile.

### Logo
Two 20px rounded squares (radius 5px): orange `#f26a1b` at top-left and blue `#2f6cf0` at bottom-right, overlapping inside a 30px box, with `mix-blend-mode: screen` on the blue one. The wordmark is "Karga" in white/ink plus "tox" in `#ff8a3d`, Clash Display 700 at 22px, letter-spacing -.02em. Ask for a proper SVG logo before launch; this one is built from CSS shapes.

---

## Public site: screens

### Shared header (`SiteHeader.dc.html`)
- Sticky, background `rgba(11,20,48,.94)` with `backdrop-filter: blur(12px)`, a bottom border of white at 8%.
- Inner row: 1240px max-width, padding 16×24.
- Contents: logo, then links (Home, Services, How we work, FAQ, Contact), then the orange pill CTA "Start an Inquiry" linking to /contact, then a 40px menu button (☰ / ✕).
- The link row has fixed height with overflow hidden and wraps, so links that don't fit disappear on narrow screens. In code, replace this with a breakpoint: below 900px hide the links and show the menu button.
- Active link: white text with a 2px orange underline. Inactive: `#c9d2ea`.
- The menu button opens a full-width dropdown with 24px display-font links.

### Shared footer (`SiteFooter.dc.html`)
- Optional CTA band (prop `showCta`, default true; false on Contact): an orange `#f26a1b` card with radius 32px and a `#1f4fc4` circle bleeding off the bottom-right.
  - H2: "We move the only number that matters. Yours."
  - Buttons: navy "Start an Inquiry →" and white "See our services".
- Footer: navy, with the logo and a one-line description, the link list, and "© 2026 Kargatox. All rights reserved."

### Home (`Home.dc.html`)
1. **Hero** (navy, two blurred radial orbs, orange bottom-left and blue top-right, slowly drifting):
   - Eyebrow pill "Strategy · Research · Growth".
   - H1 "Turning Ideas Into Products That Grow." with "That Grow." in orange. The words rise in one by one.
   - Subhead taken from the PDF.
   - CTAs: "Start an Inquiry →" and "Explore services".
   - A 3-column pillar strip (Founder Led / Hands-On / Outcome Driven) with 1px dividers and mono numbers 01–03.
2. **Marquee:** a navy band where the six sub-service names scroll left in an endless loop, separated by 12px squares alternating orange and blue.
3. **Capabilities:** eyebrow, H2 and paragraph, then two service cards (Research, Marketing) listing their sub-services as chips. Cards lift 6px on hover.
4. **Revenue check (interactive):** see the Interactions section.
5. **Process teaser:** navy. The five steps as compact cells, plus a "See the full process →" link.
6. **FAQ teaser:** H2 plus a "Read the FAQ →" button.
7. **Footer** with the CTA band.

### Services (`Services.dc.html`)
- **Hero** (navy): the intro sentence as the H1, the two intro paragraphs, and jump links to #research and #marketing.
- **Each service section** is two columns:
  - Left column (sticky at top 110px):
    - number, H2, intro text, and for Marketing the orange tagline
    - a **dashboard panel** (navy, radius 22px):
      - Research: a 12-bar chart ("Market signals"), with the last three bars orange.
      - Marketing: four keyword rows showing rank from → to, plus three channel bars (Instagram, LinkedIn, YouTube).
      - Both show three KPI tiles and a "SAMPLE DATA" tag. Replace the numbers with real ones or remove them.
  - Right column: sub-service cards (number, title, body, and an orange "Click here →" link where the PDF has one). Cards shift 6px right on hover.
- The "Click here" links need target pages (a detailed SEO page and others). Not designed yet.

### How we work (`Process.dc.html`)
- **Hero:** H1 "We do the work. / You keep the system.", with the second line in blue `#6f9bff`. Beside it, "Here is exactly what happens after you say yes." and the orange-tinted "Straight up:" note.
- **Steps:** five rows, each with a top border, a large orange number (48–80px), the title, a blue timing pill (e.g. "DAYS 1 TO 7") and the body text. Max width 1000px.

### FAQ (`FAQ.dc.html`)
- **Left column:** eyebrow "BEFORE YOU ASK", H1, and an "Ask us directly →" button.
- **Right column:** an accordion of four questions. The PDF lists "What exactly do you do?" twice; it is kept once here.
  - The first item is open by default and only one item is open at a time.
  - The toggle icon is a 36px circle: `+` on grey `#eceae4`, or `−` on orange when open.

### Contact (`Contact.dc.html`)
- Navy page.
- **Left column:** eyebrow "GET IN TOUCH", H1 "Initiate a Project", intro text, steps 01 Discovery Call and 02 Scope Definition, and "Prefer email?" with the address. `hello@kargatox.com` is a placeholder; confirm the real address.
- **Right column:** form card (navy-800, radius 24px) with underline-style inputs:
  - Full name* and Work email*
  - Phone (optional) and Service required (select: General Inquiry, Market Research, Consumer Behaviour & Satisfaction Analysis, Campaign Analytics, SEO Services, Social Media Marketing, Brand Campaigns Strategy)
  - Project details* (textarea, full width)
  - "Submit Inquiry" button (orange, full width, radius 12px)
- **Validation:** name is required; email must match `^\S+@\S+\.\S+$`; details are required. An invalid field turns its underline orange and shows an error message below it. Errors clear as the user types.
- **Success state:** a check-mark circle, "Thanks, {firstName}.", a line saying the team will reply to {email} within one business day, and a "Send another inquiry" button.
- **URL prefill:** `?service=` sets the Service select and `?note=` puts text at the top of Project details. The revenue check uses this.
- **Backend:** POST `/api/enquiries`. Save with `status=New`, `owner=null`, and `source` set to "Contact form" or "Revenue check" (from the note or a hidden field). Send a notification email to the addresses in admin settings and, if enabled, an auto-reply to the customer. Add rate limiting and a honeypot field or Cloudflare Turnstile.

---

## Admin panel: screens (`Admin.dc.html`)

### Layout
- **Sidebar:** 240px wide, navy, sticky, full height. Contents: logo with an "ADMIN" tag; nav (Dashboard, Enquiries with an orange count of New enquiries, Revenue checks, Pages, Services & FAQ, Blog & case studies, Team, Settings); "View live site ↗"; the current user's avatar, name and role.
  - Active nav item: background white at 10%, white text. Inactive: `#aeb9d8`.
- **Top bar** (sticky): mono breadcrumb, H1 page title, global search (filters enquiries and posts), and a Light/Dark toggle.
  - Save the theme choice per user (localStorage or user preferences).
- **Content area:** padding 28px, gap 22px.
- **Toast:** fixed bottom-right, navy, with a green ✓. Appears after every save or action and disappears after 2.2 seconds.

### Dashboard
- Four KPI cards: Enquiries (30 days), Revenue checks completed, Check → enquiry rate, Site visitors. Each has a value and a green delta.
- "Enquiries per week" chart: 12 bars, with the last two orange.
- "Traffic sources": horizontal bars. Pull this from the Google Analytics Data API.
- "Latest enquiries": four rows; clicking one opens it in Enquiries.
- "Top pages": page name with view count.

### Enquiries
- **Toolbar:** status filter chips with counts (All, New, Contacted, Proposal, Won, Lost) and an "↓ Export CSV" button. The export includes the currently filtered rows: Name, Company, Email, Phone, Service, Status, Owner, Date, Source, Message.
- **Table** (scrolls sideways, min-width 820px): Contact (name, a "CHECK" badge if the source is the revenue check, then company · email), Service, Status pill, Owner, Date. Clicking a row opens the detail panel.
- **Detail panel** (420px, alongside the table):
  - Header: name, company · source, and a close button.
  - Details: email, phone, service and received date.
  - **Pipeline:** five segmented buttons. The active one is filled with its status colour. Changing it updates the status and shows a toast.
  - **Assigned to:** select listing Unassigned plus team members.
  - **Conversation:** the original message, then sent replies (blue-tinted, indented).
  - **Reply by email:**
    - Three templates insert text: "Book discovery call", "Request details", "Send proposal".
    - There is a textarea and a "Send reply" button.
    - Sending adds the reply to the thread. If the enquiry was New, it moves to Contacted.
    - In production, send from the domain with Resend or SMTP and store each message in `EnquiryMessage`. Ideally, handle incoming replies too (Resend inbound or a Gmail API webhook).

### Revenue checks
- Stats: checks completed, then the share of checks where Leads, Sales or Retention was the weakest area.
- Table: visitor (email, or "visitor · city" if anonymous), date, three score bars (0 = 25% width orange `#ff8a3d`, 1 = 60% blue `#6f9bff`, 2 = 100% green `#1f9d63`), weakest area, and outcome ("Sent enquiry" pill or "No enquiry").
- The public Home page should POST each completed check to `/api/revenue-checks` as `{leads, sales, retention, weakest, sessionId}`, and link it to the enquiry if the visitor submits one.

### Pages
- Left: list of pages, each with a dot (green = published, orange = unpublished changes).
- Right: editor for each text field on the chosen page (textareas), plus a "Preview ↗" link and a "Publish" button.
- Fields per page:
  - Home: hero headline, hero subheading, capabilities heading, capabilities body.
  - Services: intro headline, intro paragraph 1, intro paragraph 2.
  - How we work: headline, subline, straight-up note.
  - FAQ: heading.
  - Contact: heading, intro.
- Store the fields as key/value pairs in `PageContent` with separate draft and published versions. Publishing triggers `revalidatePath`.

### Services & FAQ
- Tabs: Services, FAQ.
- Services: one card per service. Each sub-service row has an editable title and body, plus ↑, ↓ and ✕ buttons; "+ Add sub-service" adds a row.
- FAQ: the same row pattern with question and answer fields; "+ Add question" adds one.
- A "Save changes" button at the bottom.

### Blog & case studies
- **List:** filter chips (All, Blog, Case study) and "+ New post". Cards show a cover image placeholder, type tag (blue for Blog, orange for Case study), status tag (green Published or grey Draft), title, author and date.
- **Editor:**
  - Top: "← All posts", then Delete, Save draft and Publish buttons.
  - Main column: large title input, cover image drop area, excerpt, body.
  - Side column: type, author, URL slug, SEO title, meta description, and a preview of how the post will look in search results.
- Use a rich-text editor (Tiptap) for the body. Store cover images in S3, Supabase Storage or Vercel Blob.

### Team
- "{n} of 5 seats used" and "+ Invite member". The invite form has name, email, role and "Send invite"; it validates the email and blocks inviting when all 5 seats are used.
- Member rows: avatar, name, email, role select, last active, and remove (✕). The Owner cannot be removed.
- Role cards:
  - **Owner:** everything, including billing.
  - **Admin:** all content, enquiries, settings and team.
  - **Editor:** pages, services, FAQ and blog.
  - **Sales:** enquiries and revenue checks; can reply and export.
- Enforce these permissions on the server, not just in the interface.

### Settings
- **General:** site name, notification email, also-notify (comma-separated), auto-reply message; switches for "Send auto-reply" and "Slack alerts".
- **SEO:** default meta title (under 60 characters) and description (under 160), default social share image (1200×630), and switches for "Generate sitemap.xml" and "Allow search engines to index".
- **Integrations:** cards with an on/off switch for Google Analytics, CRM (Zoho / HubSpot), Email (SMTP / Gmail), WhatsApp Business, Slack, and Meta Pixel. Connected cards get a blue border and a green "CONNECTED" label. Each needs a real connection flow using API keys or OAuth.
- A "Save settings" button.

---

## Interactions and behaviour

### Revenue check (Home)
- Three questions, shown one at a time:
  1. Leads: "How predictable is your lead flow?"
  2. Sales: "How many qualified leads turn into customers?"
  3. Retention: "How many customers come back or renew?"
- Each has three answers scoring 2, 1 or 0 (exact labels in `Home.dc.html`).
- Progress bar: three segments (answered = orange, current = blue, remaining = grey), with a "1 / 3" counter and a Back button.
- Right-hand navy panel: live meters per area ("Not answered" 8% width, "Leaking" 28% orange, "Needs work" 62% blue, "Healthy" 100% green) with a width transition of .9s using `cubic-bezier(.2,.7,.1,1)`, and a total score out of 6.
- **Result:**
  - The weakest area is the lowest score; ties go to Leads, then Sales, then Retention.
  - Shows a title, body text, two recommended services as chips, and a CTA "Fix my {area} →". The CTA links to `/contact?service=…&note=Revenue check result: {Area} needs attention.`, plus a Retake button.
  - If all scores are 2, the title is "You're in good shape. Let's find the next lever."
- The question and result copy was written by the designer, not taken from the PDF. Have the client review it.

### Animations
All use easing `cubic-bezier(.2,.7,.1,1)`. Turn them all off under `prefers-reduced-motion: reduce`.
- **Home hero words:** each word is wrapped in an `overflow:hidden` span and animates `translateY(110%) → 0` over 1000ms, with a delay of 150 + index × 80ms.
- **Scroll reveal:** every section h1, h2, p and pill button animates opacity 0 → 1 and `translateY(32px) → 0` over 900ms. It triggers once when the element enters the viewport (IntersectionObserver, threshold .12, rootMargin `0 0 -40px 0`).
- **Stagger:** children of `[data-stagger]` containers (card grids, step lists, FAQ list, contact steps) use the same reveal with a delay of (index mod 6) × 90ms.
- **Bar growth:** `[data-grow="y"]` bars animate `scaleY(0) → 1` from the bottom, and `[data-grow="x"]` bars `scaleX(0) → 1` from the left. 1100ms, delay 200 + index × 50ms, triggered on scroll.
- **Floating orbs:** `[data-float]` blobs move `translate(±60px, 40px) scale(1.12)`, alternating direction forever, over 9–15 seconds with ease-in-out.
- **Marquee:** a track holding two copies of the list moves `translateX(0 → -50%)` over 40 seconds, linear, forever.
- **Hover:** cards transition transform over .5s and border colour over .3s. Buttons change background instantly.
- In the prototype this all lives in `SiteHeader`'s `componentDidMount`, using a MutationObserver and the Web Animations API. In Next.js, make a `<Reveal>` component (Framer Motion `whileInView`) and a `useReducedMotion` guard.

### Responsiveness
Everything is fluid:
- `clamp()` for type sizes
- `auto-fit`/`minmax` grids
- flex-wrap on button rows
- admin tables inside horizontally scrolling wrappers with min-widths

The admin sidebar stacks above the content on narrow screens. For production, collapse it into a drawer below 1024px.

---

## Data model (Prisma sketch)
```
User { id, name, email, role: OWNER|ADMIN|EDITOR|SALES, lastActiveAt, invitedAt, acceptedAt }
Enquiry { id, name, email, phone?, company?, service, details, status: NEW|CONTACTED|PROPOSAL|WON|LOST,
          ownerId?, source: CONTACT_FORM|REVENUE_CHECK, revenueCheckId?, createdAt }
EnquiryMessage { id, enquiryId, direction: IN|OUT, fromUserId?, body, sentAt }
RevenueCheck { id, leads, sales, retention, weakest, sessionId, email?, city?, createdAt }
PageContent { id, page, key, draftValue, publishedValue, updatedById, updatedAt }
Service { id, title, intro, tagline?, order } ; SubService { id, serviceId, title, body, linkLabel?, linkHref?, order }
Faq { id, question, answer, order }
Post { id, type: BLOG|CASE_STUDY, status: DRAFT|PUBLISHED, title, slug, excerpt, body(json), coverUrl?,
       authorId, seoTitle, seoDesc, publishedAt? }
Setting { key, value(json) }   // general, seo, integrations
AuditLog { id, userId, action, entity, entityId, at }
```
Seed the database with the content in `designs/*.dc.html` (the arrays in each `class Component`) and the PDF.

## Assets
- No images are included yet. Placeholders are the striped boxes (blog covers and the social share image) and the sample-data dashboards on Services. Ask the client for photos and brand imagery.
- The icons in the admin sidebar are Unicode glyphs. Replace them with Lucide icons (similar names: LayoutDashboard, Mail, PieChart, FileText, List, PenLine, Users, Settings).
- Fonts: Clash Display, Satoshi (Fontshare, free licence) and JetBrains Mono (Google Fonts).

## Files
```
designs/Home.dc.html        Home (hero, marquee, capabilities, revenue check, teasers)
designs/Services.dc.html    Services with dashboard panels
designs/Process.dc.html     How we work
designs/FAQ.dc.html         FAQ accordion
designs/Contact.dc.html     Enquiry form + success state + URL prefill
designs/SiteHeader.dc.html  Shared header + global animation engine + font loader
designs/SiteFooter.dc.html  Shared CTA band + footer
designs/Admin.dc.html       Whole admin panel (all 8 sections, light/dark)
designs/support.js          Runtime needed to open the .dc.html files in a browser
content/Website-content.pdf Client's source copy
```

## Suggested build order for Claude Code
1. Scaffold Next.js, TypeScript and Tailwind. Put the tokens above into `tailwind.config` (colours, fonts, radius) and load the fonts.
2. Build the header, footer and `<Reveal>` animation primitives, then the five public pages with static content.
3. Contact form: API route, validation (zod), database write, emails, spam protection.
4. Revenue check component plus its API route.
5. Prisma schema, seed data, Auth.js with roles, and the admin layout (sidebar, top bar, theme toggle).
6. Admin: Enquiries (list, detail, pipeline, assignment, reply, CSV) → Revenue checks → Dashboard.
7. Admin: Pages, Services & FAQ, Posts, plus the public blog pages, with publish triggering ISR.
8. Admin: Team (invites by email) and Settings/Integrations.
9. SEO (metadata, sitemap, robots, Open Graph), analytics, accessibility checks, Lighthouse above 90.

### First prompt to paste into Claude Code
> Read `design_handoff_kargatox/README.md` and open the files in `design_handoff_kargatox/designs/`. Build the Kargatox website and admin panel in Next.js 14 (App Router), TypeScript, Tailwind, Prisma + Postgres and Auth.js, following the README's tokens, screens, interactions and data model exactly. Start with steps 1–3 of the build order and show me the result before continuing.
