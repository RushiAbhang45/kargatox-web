const path = require("path");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

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

app.use("/", require("./routes/site"));
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
