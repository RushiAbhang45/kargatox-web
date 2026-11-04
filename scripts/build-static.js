// Prerenders every known public route into public/*.html via a real HTTP round-trip through
// the same Express/EJS app `npm run dev` uses, so the static output is byte-for-byte what the
// dev server would have rendered for that route. Run via `npm run build:static` (or
// `npm run build`, which also rebuilds the CSS first) after any content/template change, then
// commit the regenerated public/*.html — Vercel deploys that folder directly, no build step.
//
// Setting VERCEL before requiring server.js reuses the guard server.js already has to skip its
// own app.listen() (meant for Vercel's serverless runtime) so this script can run its own
// ephemeral-port listener instead, without touching server.js.
process.env.VERCEL = "1";

const http = require("http");
const path = require("path");
const fs = require("fs");

const app = require("../server.js");
const { NAV_LINKS } = require("../lib/nav-links");
const { SERVICE_PAGES } = require("../lib/service-pages-data");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

const ROUTES = [
  ...NAV_LINKS.map((link) => ({
    path: link.href,
    file: link.href === "/" ? "index.html" : link.href.replace(/^\//, "") + ".html",
  })),
  ...SERVICE_PAGES.map((page) => ({ path: "/" + page.slug, file: page.slug + ".html" })),
  // /blog/:slug isn't included — no real posts exist yet (Phase 8 still isn't built), so
  // there's nothing concrete to pre-render.
  { path: "/blog", file: "blog.html" },
];

function fetchPath(baseUrl, routePath) {
  return new Promise((resolve, reject) => {
    http
      .get(baseUrl + routePath, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(routePath + " -> HTTP " + res.statusCode));
            return;
          }
          resolve(body);
        });
      })
      .on("error", reject);
  });
}

function notFoundPageHtml() {
  return `<!doctype html>
<html lang="en" class="h-full antialiased">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Page Not Found | Kargatox</title>
<meta name="description" content="The page you are looking for does not exist. Explore Kargatox research and marketing services or contact our Pune team." />
<meta name="robots" content="noindex, follow" />
<link rel="icon" href="/favicon.ico" />
<link rel="stylesheet" href="/css/styles.css" />
</head>
<body class="min-h-full flex flex-col items-center justify-center gap-4 bg-ink text-white font-body px-6 text-center">
<p class="font-mono text-[12px] uppercase tracking-[0.14em] text-orange-400">404</p>
<h1 class="font-display text-[clamp(28px,4vw,48px)] font-bold">Page not found.</h1>
<p class="max-w-[420px] text-mist-2">The page you're looking for doesn't exist or has moved.</p>
<a href="/" class="mt-2 rounded-pill bg-orange-500 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-orange-400">Back to home →</a>
<p class="mt-4 text-[14px] text-mist-2">Need help? Call <a href="tel:+917887789471" class="text-white hover:text-orange-400">+91 78877 89471</a> or email <a href="mailto:Kargatox@gmail.com" class="text-white hover:text-orange-400">Kargatox@gmail.com</a></p>
</body>
</html>
`;
}

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = "http://127.0.0.1:" + port;

  try {
    for (const route of ROUTES) {
      const html = await fetchPath(baseUrl, route.path);
      fs.writeFileSync(path.join(PUBLIC_DIR, route.file), html);
      console.log("wrote public/" + route.file + " (from " + route.path + ")");
    }
  } finally {
    server.close();
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, "404.html"), notFoundPageHtml());
  console.log("wrote public/404.html");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
