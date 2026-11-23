const path = require("path");
const express = require("express");

// Local dev only — Vercel injects env vars directly, and there's no .env file in that
// environment for this to find (it's gitignored), so this is a silent no-op there.
if (!process.env.VERCEL) {
  try {
    require("dotenv").config({ path: path.join(__dirname, ".env") });
  } catch {
    // dotenv not installed (e.g. a fresh clone before `npm install`) — fine, just
    // means local dev won't have DATABASE_URL/AUTH_SECRET until it's added.
  }
}

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
// 16 KB is ample for any form on this site; larger bodies are refused before any route runs.
app.use(express.json({ limit: "16kb" }));

// EJS templates rendered via res.render() don't close over this module's `require` —
// shared, request-independent data the partials need (nav links, service pages) goes
// on app.locals instead, which Express merges into every template's scope by name.
app.locals.NAV_LINKS = require("./lib/nav-links").NAV_LINKS;
const servicePagesData = require("./lib/service-pages-data");
app.locals.SERVICE_PAGES = servicePagesData.SERVICE_PAGES;
app.locals.SERVICE_PAGE_GROUPS = servicePagesData.SERVICE_PAGE_GROUPS;
app.locals.SUB_SERVICE_HREFS = servicePagesData.SUB_SERVICE_HREFS;
app.locals.PROCESS_STEPS = require("./lib/process-steps").PROCESS_STEPS;
const seoData = require("./lib/seo-data");
app.locals.SITE_URL = seoData.SITE_URL;
app.locals.GA_MEASUREMENT_ID = seoData.GA_MEASUREMENT_ID;
app.locals.GOOGLE_SITE_VERIFICATION = seoData.GOOGLE_SITE_VERIFICATION;
app.locals.LOGO_URL = seoData.LOGO_URL;
app.locals.CLARITY_PROJECT_ID = seoData.CLARITY_PROJECT_ID;
app.locals.CALENDLY_URL = seoData.CALENDLY_URL;
app.locals.CONTACT_EMAIL = seoData.CONTACT_EMAIL;
app.locals.GEO_LATITUDE = seoData.GEO_LATITUDE;
app.locals.GEO_LONGITUDE = seoData.GEO_LONGITUDE;
app.locals.CONTENT_UPDATED_DATE = seoData.CONTENT_UPDATED_DATE;

// Router mounted BEFORE express.static deliberately: public/*.html is prerendered
// output (scripts/build-static.js) that this same server serves at those same paths
// (e.g. public/index.html for GET /). If static came first, it would permanently
// shadow the live EJS route with whatever was last prerendered — including when
// build-static.js itself scrapes this server, making "regenerate the static output"
// silently re-write the same stale content back to itself. Static stays mounted for
// genuine assets (/css, /js, /images, /favicon.ico) that have no matching route.
app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/api"));
app.use("/", require("./routes/site"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.status(404).send("Not found");
});

// Malformed or oversized JSON sent to /api/* (from express.json above) gets a short JSON
// error instead of Express's default HTML error page.
app.use((err, req, res, next) => {
  if (req.path.startsWith("/api/") && (err.type === "entity.parse.failed" || err.type === "entity.too.large")) {
    return res.status(err.status || 400).json({ error: err.type === "entity.too.large" ? "Request too large." : "Invalid request body." });
  }
  next(err);
});

module.exports = app;

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Kargatox server listening on http://localhost:${port}`));
}
