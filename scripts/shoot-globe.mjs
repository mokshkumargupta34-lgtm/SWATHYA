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
  defaultViewport: { width: 1280, height: 820 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
await sleep(3500);
const top = await page.evaluate(() => {
  const s = document.querySelector('section[aria-label="Youth mental health"]');
  return s ? s.getBoundingClientRect().top + window.scrollY : null;
});
if (top == null) { console.log("section not found"); await browser.close(); process.exit(1); }
await page.evaluate((y) => window.scrollTo(0, y), top); // align section to viewport top
await sleep(3000); // let WebGL render
await page.screenshot({ path: `${OUT}globe-whole.png` });
console.log("captured globe-whole.png");
await browser.close();
