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
await sleep(3500);

// Scroll so the TOP edge of the dark particle (reach) section sits mid-viewport.
const top = await page.evaluate(() => {
  const sections = [...document.querySelectorAll("section")];
  // the reach section is the one with bg-black + a canvas
  const reach = sections.find((s) => s.querySelector("canvas") && getComputedStyle(s).backgroundColor === "rgb(0, 0, 0)");
  if (!reach) return null;
  return reach.getBoundingClientRect().top + window.scrollY;
});
if (top == null) { console.log("reach section not found"); await browser.close(); process.exit(1); }
await page.evaluate((y) => window.scrollTo(0, y - 430), top); // put seam ~mid-screen
await sleep(2500);
await page.screenshot({ path: `${OUT}seam-reach.png` });
console.log("captured seam-reach.png");
await browser.close();
