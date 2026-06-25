import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\swasthya-verify\\";
mkdirSync(OUT, { recursive: true });
const PROFILE = `${OUT}p-${Date.now()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--hide-scrollbars", `--user-data-dir=${PROFILE}`],
  defaultViewport: { width: 1280, height: 760 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
await sleep(3000);
const btn = await page.$('button[aria-label="Choose language"]');
if (!btn) { console.log("language button NOT found"); await browser.close(); process.exit(1); }
await btn.click();
await sleep(800);
const items = await page.$$eval('[translate="no"] button', (els) => els.map((e) => e.textContent.trim()).filter(Boolean));
console.log("menu items:", JSON.stringify(items));
await page.screenshot({ path: `${OUT}lang-menu.png`, clip: { x: 700, y: 0, width: 580, height: 520 } });
console.log("captured lang-menu.png");
await browser.close();
