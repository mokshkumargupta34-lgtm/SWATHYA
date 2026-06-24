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
  defaultViewport: { width: 1280, height: 900 },
});
const page = await browser.newPage();
for (const [path, name, sel] of [
  ["/login", "fonts-login", 'input[type="email"]'],
  ["/pricing", "fonts-pricing", "h1, h2"],
]) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(sel, { timeout: 20000 }).catch(() => {});
  await sleep(2000);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured", name);
}
await browser.close();
