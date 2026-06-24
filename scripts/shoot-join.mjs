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
  defaultViewport: { width: 1366, height: 860 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/join", { waitUntil: "domcontentloaded", timeout: 60000 });
await sleep(1200);
const cards = await page.$$eval("h2", (els) => els.map((e) => e.textContent.trim()));
const links = await page.$$eval("a[href='/signup'], a[href='/doctor/signup'], a[href='/login'], a[href='/doctor/login']", (els) => els.map((e) => e.getAttribute("href")));
console.log("cards:", JSON.stringify(cards));
console.log("links:", JSON.stringify(links));
await page.screenshot({ path: `${OUT}join.png` });
console.log("captured join.png");
await browser.close();
