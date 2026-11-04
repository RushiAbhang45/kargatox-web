const path = require("path");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// EJS templates rendered via res.render() don't close over this module's `require` —
// shared, request-independent data the partials need (nav links, service pages) goes
// on app.locals instead, which Express merges into every template's scope by name.
app.locals.NAV_LINKS = require("./lib/nav-links").NAV_LINKS;
const servicePagesData = require("./lib/service-pages-data");
app.locals.SERVICE_PAGES = servicePagesData.SERVICE_PAGES;
app.locals.SERVICE_PAGE_GROUPS = servicePagesData.SERVICE_PAGE_GROUPS;
app.locals.SUB_SERVICE_HREFS = servicePagesData.SUB_SERVICE_HREFS;
app.locals.PROCESS_STEPS = require("./lib/process-steps").PROCESS_STEPS;
app.locals.SERVICES = require("./lib/services-data").SERVICES;
const seoData = require("./lib/seo-data");
app.locals.SITE_URL = seoData.SITE_URL;
app.locals.GA_MEASUREMENT_ID = seoData.GA_MEASUREMENT_ID;
app.locals.GOOGLE_SITE_VERIFICATION = seoData.GOOGLE_SITE_VERIFICATION;
app.locals.LOGO_URL = seoData.LOGO_URL;

// Router mounted BEFORE express.static deliberately: public/*.html is prerendered
// output (scripts/build-static.js) that this same server serves at those same paths
// (e.g. public/index.html for GET /). If static came first, it would permanently
// shadow the live EJS route with whatever was last prerendered — including when
// build-static.js itself scrapes this server, making "regenerate the static output"
// silently re-write the same stale content back to itself. Static stays mounted for
// genuine assets (/css, /js, /images, /favicon.ico) that have no matching route.
app.use("/", require("./routes/site"));
app.use(express.static(path.join(__dirname, "public")));
// Later phases mount:
// app.use("/api", require("./routes/api"));
// app.use("/admin", require("./routes/admin"));

app.use((req, res) => {
  res.status(404).send("Not found");
});

module.exports = app;

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Kargatox server listening on http://localhost:${port}`));
}
