import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\swasthya-verify\\";
mkdirSync(OUT, { recursive: true });
const PROFILE = `${OUT}p-${Date.now()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: [
    "--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars",
    "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    `--user-data-dir=${PROFILE}`,
  ],
  defaultViewport: { width: 1280, height: 860 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
await sleep(4000);

// Find the mental-health section and its scroll geometry.
const geo = await page.evaluate(() => {
  const s = document.querySelector('section[aria-label="Youth mental health"]');
  if (!s) return null;
  const top = s.getBoundingClientRect().top + window.scrollY;
  return { top, height: s.offsetHeight, vh: window.innerHeight };
});
if (!geo) { console.log("section not found"); await browser.close(); process.exit(1); }

const sticky = geo.height - geo.vh;
// progress 0.5 -> intact/together ; progress ~0.92 -> scattered
for (const [prog, name] of [[0.5, "anomaly-together"], [0.9, "anomaly-scattered"]]) {
  await page.evaluate((y) => window.scrollTo(0, y), geo.top + sticky * prog);
  await sleep(2600); // let WebGL render + the explode lerp settle
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured", name, "at progress", prog);
}
await browser.close();
