import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\swasthya-verify\\";
mkdirSync(OUT, { recursive: true });
const PROFILE = `${OUT}p-${Date.now()}`; // fresh profile each run -> no lock
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--hide-scrollbars", `--user-data-dir=${PROFILE}`],
  defaultViewport: { width: 1366, height: 900 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });

// Assert the new client-rendered form elements exist.
await page.waitForSelector('input[type="password"]', { timeout: 30000 });
const pwPlaceholder = await page.$eval('input[type="password"]', (el) => el.placeholder);
const signInBtn = await page.$$eval("button", (els) =>
  els.map((e) => e.textContent.trim()).filter((t) => t === "Sign In")
);
const magicLink = await page.$$eval("button", (els) =>
  els.some((e) => e.textContent.includes("Prefer a magic link"))
);
const emailField = await page.$('input[type="email"]');
console.log("ASSERT password input placeholder:", JSON.stringify(pwPlaceholder));
console.log("ASSERT email field present       :", !!emailField);
console.log("ASSERT 'Sign In' button          :", JSON.stringify(signInBtn));
console.log("ASSERT magic-link fallback        :", magicLink);

await sleep(2500); // let FloatingPaths animation paint
await page.screenshot({ path: `${OUT}login-password.png` });
console.log("captured login-password.png");
await browser.close();
