// Minimal admin panel: login + Team management, built directly into this app (not
// ported from legacy-nextjs-app) so the whole site — public pages and admin — deploys
// as one Vercel project. Mirrors the already-reviewed Team logic from
// legacy-nextjs-app/src/app/admin/(protected)/team/actions.ts: same seat limit, same
// "admin sets the password directly" creation flow, same Owner/Admin-equivalent role
// handling (no special-cased protections).
const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma, Prisma } = require("../lib/db");
const { getSession, setSessionCookie, clearSessionCookie } = require("../lib/admin-auth");
const { ENQUIRY_STATUSES, STATUS_LABEL, STATUS_COLOR_CLASS } = require("../lib/enquiry-status");
const { PAGE_KEYS, PAGE_LABELS, PAGE_ROUTES, PAGE_FIELDS, PAGE_DEFAULTS } = require("../lib/page-content-defaults");
const { POST_TYPES, POST_TYPE_LABEL, validatePost } = require("../lib/post-schema");
const { SERVICES } = require("../lib/services-data");
const { FAQ_DEFAULTS } = require("../lib/faq-defaults");

const router = express.Router();

// Same role set as legacy-nextjs-app/src/lib/roles.ts, just as plain arrays instead of a
// typed helper per role — same "Sales: enquiries/revenue checks; Editor: pages/services/
// FAQ/blog; Admin: everything" split described in design-reference's README Team section.
const ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"];
const TEAM_ACCESS_ROLES = ["OWNER", "ADMIN"];
const SETTINGS_ACCESS_ROLES = ["OWNER", "ADMIN"];
const ENQUIRY_ACCESS_ROLES = ["OWNER", "ADMIN", "SALES"];
const CONTENT_ACCESS_ROLES = ["OWNER", "ADMIN", "EDITOR"];
const MAX_TEAM_SEATS = 5;
const MIN_PASSWORD_LENGTH = 8;

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) return res.redirect("/admin/login");
  req.adminUser = session;
  next();
}

// A role mismatch renders the normal admin layout (sidebar + title) with an inline message
// instead of a bare 403 — nicer than this app's own Dashboard/Team/Settings previously did
// (legacy-nextjs-app does the same: same layout, wrong-role panel, not a dead-end page).
// req.baseUrl ("/admin") + req.path (e.g. "/enquiries") gives admin-sidebar.ejs's activeHref
// for free, no need to pass it separately at each call site.
function requireRole(roles, title) {
  return function (req, res, next) {
    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).render("admin/forbidden", {
        currentUser: req.adminUser,
        activeHref: req.baseUrl + req.path,
        title,
      });
    }
    next();
  };
}

const requireTeamAccess = requireRole(TEAM_ACCESS_ROLES, "Team");
const requireSettingsAccess = requireRole(SETTINGS_ACCESS_ROLES, "Settings");
const requireEnquiryAccess = requireRole(ENQUIRY_ACCESS_ROLES, "Enquiries");
const requireContentAccess = requireRole(CONTENT_ACCESS_ROLES, "Content");

async function renderTeam(req, res, error) {
  const members = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.render("admin/team", {
    currentUser: req.adminUser,
    members,
    maxSeats: MAX_TEAM_SEATS,
    roles: ROLES,
    error: error || null,
  });
}

const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

function weeklyBuckets(createdAts) {
  const now = Date.now();
  const buckets = Array(WEEKS).fill(0);
  for (const createdAt of createdAts) {
    const daysAgo = Math.floor((now - createdAt.getTime()) / DAY_MS);
    const weekIndex = WEEKS - 1 - Math.floor(daysAgo / 7);
    if (weekIndex >= 0 && weekIndex < WEEKS) buckets[weekIndex] += 1;
  }
  return buckets;
}

router.get("/", requireAuth, async (req, res) => {
  const now = Date.now();
  const since30d = new Date(now - 30 * DAY_MS);
  const since12w = new Date(now - WEEKS * 7 * DAY_MS);

  const [total, last30d, recentForChart, latest] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: since30d } } }),
    prisma.enquiry.findMany({ where: { createdAt: { gte: since12w } }, select: { createdAt: true } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, service: true, status: true },
    }),
  ]);

  const buckets = weeklyBuckets(recentForChart.map((e) => e.createdAt));
  const max = Math.max(1, ...buckets);

  res.render("admin/dashboard", { currentUser: req.adminUser, total, last30d, buckets, max, latest });
});

router.get("/login", (req, res) => {
  if (getSession(req)) return res.redirect("/admin/team");
  res.render("admin/login", { error: null });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.render("admin/login", { error: "Invalid email or password" });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  setSessionCookie(res, { id: user.id, email: user.email, name: user.name, role: user.role });
  res.redirect("/admin/team");
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.redirect("/admin/login");
});

router.get("/team", requireAuth, requireTeamAccess, (req, res) => renderTeam(req, res));

router.post("/team/create", requireAuth, requireTeamAccess, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "");

  if (!name) return renderTeam(req, res, "Please enter a name");
  if (!email || !email.includes("@")) return renderTeam(req, res, "Please enter a valid email");
  if (password.length < MIN_PASSWORD_LENGTH) return renderTeam(req, res, "Password must be at least 8 characters");
  if (!ROLES.includes(role)) return renderTeam(req, res, "Invalid role");

  const seatCount = await prisma.user.count();
  if (seatCount >= MAX_TEAM_SEATS) return renderTeam(req, res, `All ${MAX_TEAM_SEATS} seats are in use`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return renderTeam(req, res, "That email is already a team member");

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, role, password: hash, invitedAt: new Date(), acceptedAt: new Date() },
  });
  res.redirect("/admin/team");
});

router.post("/team/:id/role", requireAuth, requireTeamAccess, async (req, res) => {
  const role = String(req.body.role || "");
  if (ROLES.includes(role)) {
    await prisma.user.update({ where: { id: req.params.id }, data: { role } }).catch(() => {});
  }
  res.redirect("/admin/team");
});

router.post("/team/:id/remove", requireAuth, requireTeamAccess, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } }).catch(() => {});
  res.redirect("/admin/team");
});

const SETTINGS_ID = "singleton";
const SETTINGS_DEFAULTS = {
  siteName: "Kargatox",
  notificationEmail: null,
  alsoNotify: null,
  autoReplyMessage: "Hi {firstName},\n\nThank you for your requirement. Our team will contact you shortly.\n\n— Kargatox",
  sendAutoReply: true,
  gaMeasurementId: null,
  gaEnabled: false,
};
const GA_ID_PATTERN = /^[A-Za-z0-9-]+$/;

router.get("/settings", requireAuth, requireSettingsAccess, async (req, res) => {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  const settings = row || SETTINGS_DEFAULTS;
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );
  res.render("admin/settings", { currentUser: req.adminUser, settings, smtpConfigured, error: null, saved: false });
});

router.post("/settings", requireAuth, requireSettingsAccess, async (req, res) => {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );
  const renderWith = (settings, error) =>
    res.render("admin/settings", { currentUser: req.adminUser, settings, smtpConfigured, error, saved: false });

  const gaMeasurementId = String(req.body.gaMeasurementId || "").trim();
  if (gaMeasurementId && !GA_ID_PATTERN.test(gaMeasurementId)) {
    return renderWith(req.body, "GA measurement ID can only contain letters, numbers and hyphens");
  }

  const data = {
    siteName: String(req.body.siteName || "").trim() || "Kargatox",
    notificationEmail: String(req.body.notificationEmail || "").trim() || null,
    alsoNotify: String(req.body.alsoNotify || "").trim() || null,
    autoReplyMessage: String(req.body.autoReplyMessage || ""),
    sendAutoReply: req.body.sendAutoReply === "on",
    gaMeasurementId: gaMeasurementId || null,
    gaEnabled: req.body.gaEnabled === "on",
  };

  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  res.render("admin/settings", { currentUser: req.adminUser, settings: data, smtpConfigured, error: null, saved: true });
});

// ---------------------------------------------------------------------------
// Enquiries — mirrors legacy-nextjs-app's enquiries/{page.tsx,actions.ts}. No email send
// on reply (no lib/mailer.js in this app yet, per CLAUDE.md) — the message/status change
// still saves either way, matching the legacy "don't let a flaky SMTP connection surface
// as a failed reply" principle, just with nothing to try/catch around yet.
router.get("/enquiries", requireAuth, requireEnquiryAccess, async (req, res) => {
  const statusFilter = ENQUIRY_STATUSES.includes(req.query.status) ? req.query.status : null;

  const [allEnquiries, users] = await Promise.all([
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  const statusCounts = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0]));
  allEnquiries.forEach((e) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  });
  const enquiries = statusFilter ? allEnquiries.filter((e) => e.status === statusFilter) : allEnquiries;

  let selected = null;
  if (req.query.id) {
    selected = await prisma.enquiry.findUnique({
      where: { id: req.query.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true, email: true } } } },
      },
    });
  }

  res.render("admin/enquiries", {
    currentUser: req.adminUser,
    enquiries,
    users,
    selected,
    statusFilter,
    statusCounts,
    totalCount: allEnquiries.length,
    statuses: ENQUIRY_STATUSES,
    statusLabel: STATUS_LABEL,
    statusColor: STATUS_COLOR_CLASS,
  });
});

router.post("/enquiries/:id/status", requireAuth, requireEnquiryAccess, async (req, res) => {
  const status = String(req.body.status || "");
  if (ENQUIRY_STATUSES.includes(status)) {
    await prisma.enquiry.update({ where: { id: req.params.id }, data: { status } }).catch(() => {});
  }
  res.redirect("/admin/enquiries?id=" + req.params.id);
});

router.post("/enquiries/:id/assign", requireAuth, requireEnquiryAccess, async (req, res) => {
  const ownerId = String(req.body.ownerId || "").trim() || null;
  await prisma.enquiry.update({ where: { id: req.params.id }, data: { ownerId } }).catch(() => {});
  res.redirect("/admin/enquiries?id=" + req.params.id);
});

router.post("/enquiries/:id/reply", requireAuth, requireEnquiryAccess, async (req, res) => {
  const body = String(req.body.body || "").trim();
  if (body) {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (enquiry) {
      await prisma.enquiryMessage.create({ data: { enquiryId: enquiry.id, body, senderId: req.adminUser.id } });
      if (enquiry.status === "NEW") {
        await prisma.enquiry.update({ where: { id: enquiry.id }, data: { status: "CONTACTED" } });
      }
    }
  }
  res.redirect("/admin/enquiries?id=" + req.params.id);
});

// ---------------------------------------------------------------------------
// Revenue checks — read-only, mirrors legacy's revenue-checks/page.tsx (which has no
// actions.ts — there's nothing to mutate here, only Enquiry rows it may have produced).
router.get("/revenue-checks", requireAuth, requireEnquiryAccess, async (req, res) => {
  const checks = await prisma.revenueCheck.findMany({
    orderBy: { createdAt: "desc" },
    include: { enquiries: { select: { id: true } } },
  });

  const total = checks.length;
  const weakestCounts = { leads: 0, sales: 0, retention: 0 };
  checks.forEach((c) => {
    if (weakestCounts[c.weakest] !== undefined) weakestCounts[c.weakest] += 1;
  });
  const weakestPct = Object.fromEntries(
    Object.entries(weakestCounts).map(([k, v]) => [k, total ? Math.round((v / total) * 100) : 0])
  );

  res.render("admin/revenue-checks", { currentUser: req.adminUser, checks, total, weakestPct });
});

// ---------------------------------------------------------------------------
// Pages — the DB-backed half of Phase 2, but only for the admin editor; routes/site.js
// doesn't read PageContent yet (see CLAUDE.md), so Publish here doesn't change the public
// site's render until that phase lands. Mirrors legacy's pages/{page.tsx,actions.ts}.
function sanitizePageFields(page, fields) {
  const allowedKeys = PAGE_FIELDS[page].map((f) => f.key);
  const clean = {};
  for (const key of allowedKeys) clean[key] = String((fields && fields[key]) ?? "").trim();
  return clean;
}

router.get("/pages", requireAuth, requireContentAccess, async (req, res) => {
  const rows = await prisma.pageContent.findMany();
  const rowsByPage = Object.fromEntries(rows.map((r) => [r.page, r]));
  const selectedPage = PAGE_KEYS.includes(req.query.page) ? req.query.page : PAGE_KEYS[0];

  const row = rowsByPage[selectedPage];
  const published = { ...PAGE_DEFAULTS[selectedPage], ...(row ? row.published : {}) };
  const draft = row && row.draft ? { ...published, ...row.draft } : null;

  res.render("admin/pages", {
    currentUser: req.adminUser,
    pageKeys: PAGE_KEYS,
    pageLabels: PAGE_LABELS,
    pageRoutes: PAGE_ROUTES,
    pageFields: PAGE_FIELDS,
    hasDraft: Object.fromEntries(PAGE_KEYS.map((k) => [k, Boolean(rowsByPage[k] && rowsByPage[k].draft)])),
    selectedPage,
    values: draft || published,
    saved: req.query.saved || null,
  });
});

router.post("/pages/:page/draft", requireAuth, requireContentAccess, async (req, res) => {
  const page = req.params.page;
  if (!PAGE_KEYS.includes(page)) return res.redirect("/admin/pages");
  const clean = sanitizePageFields(page, req.body);
  await prisma.pageContent.upsert({
    where: { page },
    update: { draft: clean },
    create: { page, draft: clean, published: PAGE_DEFAULTS[page] },
  });
  res.redirect("/admin/pages?page=" + page + "&saved=draft");
});

router.post("/pages/:page/publish", requireAuth, requireContentAccess, async (req, res) => {
  const page = req.params.page;
  if (!PAGE_KEYS.includes(page)) return res.redirect("/admin/pages");
  const clean = sanitizePageFields(page, req.body);
  await prisma.pageContent.upsert({
    where: { page },
    update: { draft: Prisma.JsonNull, published: clean },
    create: { page, draft: Prisma.JsonNull, published: clean },
  });
  res.redirect("/admin/pages?page=" + page + "&saved=published");
});

// ---------------------------------------------------------------------------
// Services & FAQ — mirrors legacy's services-faq/{page.tsx,actions.ts}: one combined
// "Save changes" does a full delete+recreate per serviceKey (and for FaqItem globally),
// not a diff. Falls back to lib/services-data.js's hardcoded items / lib/faq-defaults.js
// until rows exist, same "default until edited" pattern as Pages above.
router.get("/services-faq", requireAuth, requireContentAccess, async (req, res) => {
  const [subServiceRows, faqRows] = await Promise.all([
    prisma.subService.findMany({ orderBy: { order: "asc" } }),
    prisma.faqItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  const subServicesByKey = {};
  SERVICES.forEach((svc) => {
    const rows = subServiceRows.filter((r) => r.serviceKey === svc.id);
    subServicesByKey[svc.id] =
      rows.length > 0
        ? rows.map((r) => ({ title: r.title, body: r.body, link: r.link || "" }))
        : svc.items.map((it) => ({ title: it.title, body: it.body, link: it.link || "" }));
  });

  const faqItems =
    faqRows.length > 0
      ? faqRows.map((r) => ({ question: r.question, answer: r.answer }))
      : FAQ_DEFAULTS.map((f) => ({ question: f.question, answer: f.answer }));

  res.render("admin/services-faq", {
    currentUser: req.adminUser,
    services: SERVICES,
    subServicesByKey,
    faqItems,
    tab: req.query.tab === "faq" ? "faq" : "services",
    saved: req.query.saved === "1",
  });
});

router.post("/services-faq", requireAuth, requireContentAccess, async (req, res) => {
  const subServicesInput = req.body.subServices || {};
  const faqInput = req.body.faqItems || [];

  const cleanSubServices = {};
  SERVICES.forEach((svc) => {
    const raw = subServicesInput[svc.id];
    const rows = Array.isArray(raw) ? raw : Object.values(raw || {});
    cleanSubServices[svc.id] = rows
      .map((it) => ({
        title: String((it && it.title) || "").trim(),
        body: String((it && it.body) || "").trim(),
        link: String((it && it.link) || "").trim() || null,
      }))
      .filter((it) => it.title && it.body);
  });

  const faqRows = Array.isArray(faqInput) ? faqInput : Object.values(faqInput);
  const cleanFaq = faqRows
    .map((it) => ({
      question: String((it && it.question) || "").trim(),
      answer: String((it && it.answer) || "").trim(),
    }))
    .filter((it) => it.question && it.answer);

  // Array-form (batch) $transaction, not the callback/interactive form — Neon's pooled
  // connection (DATABASE_URL, pgbouncer) doesn't reliably support Prisma's interactive
  // transaction protocol (observed: P2028 "Unable to start a transaction in the given
  // time"); the pre-built-array form sends one batched request instead, which works fine
  // over the pooler.
  const ops = [];
  for (const svc of SERVICES) {
    ops.push(prisma.subService.deleteMany({ where: { serviceKey: svc.id } }));
    if (cleanSubServices[svc.id].length > 0) {
      ops.push(
        prisma.subService.createMany({
          data: cleanSubServices[svc.id].map((it, i) => ({ serviceKey: svc.id, order: i, ...it })),
        })
      );
    }
  }
  ops.push(prisma.faqItem.deleteMany({}));
  if (cleanFaq.length > 0) {
    ops.push(prisma.faqItem.createMany({ data: cleanFaq.map((it, i) => ({ order: i, ...it })) }));
  }
  await prisma.$transaction(ops);

  res.redirect("/admin/services-faq?tab=" + (req.body.activeTab === "faq" ? "faq" : "services") + "&saved=1");
});

// ---------------------------------------------------------------------------
// Blog & case studies — mirrors legacy's blog/{page.tsx,[id]/page.tsx,new/page.tsx,
// actions.ts}, except `body` is plain HTML/text in a <textarea> rather than legacy's
// Tiptap JSON — see lib/post-schema.js's header comment for why.
async function renderBlogEdit(req, res, { post, error }) {
  const authors = await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } });
  res.render("admin/blog-edit", {
    currentUser: req.adminUser,
    post,
    authors,
    types: POST_TYPES,
    typeLabel: POST_TYPE_LABEL,
    error: error || null,
  });
}

router.get("/blog", requireAuth, requireContentAccess, async (req, res) => {
  const typeFilter = POST_TYPES.includes(req.query.type) ? req.query.type : null;
  const posts = await prisma.post.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
  res.render("admin/blog-list", { currentUser: req.adminUser, posts, typeFilter, typeLabel: POST_TYPE_LABEL });
});

router.get("/blog/new", requireAuth, requireContentAccess, (req, res) => renderBlogEdit(req, res, { post: null }));

router.get("/blog/:id", requireAuth, requireContentAccess, async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.redirect("/admin/blog");
  renderBlogEdit(req, res, { post });
});

async function saveBlogPost(req, res, status) {
  const id = req.params.id || null;
  const input = {
    title: String(req.body.title || "").trim(),
    slug: String(req.body.slug || "").trim().toLowerCase(),
    type: String(req.body.type || ""),
    authorId: String(req.body.authorId || "").trim() || null,
    excerpt: String(req.body.excerpt || "").trim(),
    body: String(req.body.body || ""),
    seoTitle: String(req.body.seoTitle || "").trim(),
    seoDescription: String(req.body.seoDescription || "").trim(),
  };

  const validationError = validatePost(input);
  if (validationError) {
    return renderBlogEdit(req, res, { post: { id, ...input }, error: validationError });
  }

  const slugOwner = await prisma.post.findUnique({ where: { slug: input.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return renderBlogEdit(req, res, { post: { id, ...input }, error: "That URL slug is already used by another post" });
  }

  let publishedAt;
  if (status === "PUBLISHED") {
    const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
    publishedAt = (existing && existing.publishedAt) || new Date();
  }

  const payload = {
    title: input.title,
    slug: input.slug,
    type: input.type,
    authorId: input.authorId,
    excerpt: input.excerpt || null,
    body: input.body,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    status,
    ...(publishedAt !== undefined ? { publishedAt } : {}),
  };

  const post = id
    ? await prisma.post.update({ where: { id }, data: payload })
    : await prisma.post.create({ data: payload });

  res.redirect("/admin/blog/" + post.id);
}

router.post("/blog", requireAuth, requireContentAccess, (req, res) =>
  saveBlogPost(req, res, req.body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT")
);

router.post("/blog/:id", requireAuth, requireContentAccess, (req, res) =>
  saveBlogPost(req, res, req.body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT")
);

router.post("/blog/:id/delete", requireAuth, requireContentAccess, async (req, res) => {
  await prisma.post.delete({ where: { id: req.params.id } }).catch(() => {});
  res.redirect("/admin/blog");
});

module.exports = router;
