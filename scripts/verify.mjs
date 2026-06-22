import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\swasthya-verify\\";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const PROFILE = `${OUT}chrome-profile`;
mkdirSync(PROFILE, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  dumpio: true,
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    `--user-data-dir=${PROFILE}`,
  ],
  defaultViewport: { width: 1366, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();

async function shot(name) {
  await page.screenshot({ path: `${OUT}${name}.png` });
  log(`  shot -> ${name}.png`);
}

// 1) Middleware guard: /app while unauthenticated must redirect to /login
log("\n[1] GET /app (unauthenticated)");
await page.goto("http://localhost:3000/app", { waitUntil: "domcontentloaded", timeout: 90000 });
log("  final URL:", page.url());
await shot("1-app-redirect");

// 2) New static pages
for (const p of ["privacy", "terms", "support"]) {
  log(`\n[2] GET /${p}`);
  await page.goto(`http://localhost:3000/${p}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  const h1 = await page.$eval("h1", (el) => el.textContent.trim()).catch(() => "(no h1)");
  log("  status URL:", page.url(), "| h1:", h1);
  await shot(`2-${p}`);
}

// 3) Footer link wiring on the landing page (anchors should point to real pages)
log("\n[3] Landing footer link hrefs");
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 90000 });
await sleep(3500);
const footerLinks = await page.$$eval("a[href='/privacy'], a[href='/terms'], a[href='/support']", (els) =>
  els.map((e) => `${e.textContent.trim()} -> ${e.getAttribute("href")}`)
);
log("  footer anchors:", JSON.stringify(footerLinks));

// 4) API auth guards via real Next handlers (fetch from the page, same-origin)
log("\n[4] API routes (unauthenticated) — expect 401");
const apiProbes = await page.evaluate(async () => {
  const calls = [
    ["GET", "/api/dashboard"],
    ["GET", "/api/records"],
    ["GET", "/api/consults"],
    ["GET", "/api/medicines?q=para"],
    ["GET", "/api/family"],
    ["GET", "/api/profile"],
    ["POST", "/api/records", "{bad json"], // probe: malformed body, still unauth
    ["POST", "/api/consults", JSON.stringify({})], // probe: empty body, still unauth
  ];
  const out = [];
  for (const [method, url, body] of calls) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ?? undefined,
    });
    let parsed;
    try { parsed = await res.json(); } catch { parsed = "(non-json)"; }
    out.push({ method, url, status: res.status, body: parsed });
  }
  return out;
});
for (const r of apiProbes) log(`  ${r.method} ${r.url} -> ${r.status} ${JSON.stringify(r.body)}`);

// 5) Auth screens still render
for (const p of ["login", "signup"]) {
  log(`\n[5] GET /${p}`);
  await page.goto(`http://localhost:3000/${p}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(1500);
  await shot(`5-${p}`);
  log("  rendered:", page.url());
}

await browser.close();
log("\nDONE");
