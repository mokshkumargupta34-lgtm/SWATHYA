import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\shots\\";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
  ],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 45000 });
await sleep(4500);

const h = await page.evaluate(() => document.body.scrollHeight);
console.log("scrollHeight:", h);

// hero region (was blank), then the new shader CTA near the end (before footer)
const targets = [1100, 2600, h - 1750, h - 1500];
let n = 0;
for (const y of targets) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await sleep(1800);
  const name = `chk-${n++}-${Math.round(y)}`;
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured", name);
}

await browser.close();
console.log("done");
