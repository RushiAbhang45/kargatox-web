// Minimal admin panel: login + Team management, built directly into this app (not
// ported from legacy-nextjs-app) so the whole site — public pages and admin — deploys
// as one Vercel project. Mirrors the already-reviewed Team logic from
// legacy-nextjs-app/src/app/admin/(protected)/team/actions.ts: same seat limit, same
// "admin sets the password directly" creation flow, same Owner/Admin-equivalent role
// handling (no special-cased protections).
const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/db");
const { getSession, setSessionCookie, clearSessionCookie } = require("../lib/admin-auth");

const router = express.Router();

const ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"];
const TEAM_ACCESS_ROLES = ["OWNER", "ADMIN"];
const MAX_TEAM_SEATS = 5;
const MIN_PASSWORD_LENGTH = 8;

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) return res.redirect("/admin/login");
  req.adminUser = session;
  next();
}

function requireTeamAccess(req, res, next) {
  if (!TEAM_ACCESS_ROLES.includes(req.adminUser.role)) {
    return res.status(403).send("Not authorized");
  }
  next();
}

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

router.get("/", requireAuth, (req, res) => res.redirect("/admin/team"));

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

module.exports = router;
