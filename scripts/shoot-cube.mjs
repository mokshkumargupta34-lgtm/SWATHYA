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
await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector('input[type="email"]', { timeout: 20000 }).catch(() => {});
await sleep(4000); // let WebGL render a few frames
await page.screenshot({ path: `${OUT}login-cube.png`, clip: { x: 0, y: 0, width: 640, height: 820 } });
console.log("captured login-cube.png");
await browser.close();
