import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 45000 });
await sleep(3500);

async function busy(label, y) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await sleep(1200);
  const a = await page.metrics();
  await sleep(2000);
  const b = await page.metrics();
  const script = b.ScriptDuration - a.ScriptDuration;
  const task = b.TaskDuration - a.TaskDuration;
  const layout = b.LayoutDuration - a.LayoutDuration;
  // How much of the 2s window the main thread was busy running tasks (JS+layout+style).
  console.log(
    `${label.padEnd(8)} mainthread-busy=${(task / 2 * 100).toFixed(0)}%  script=${script.toFixed(2)}s  layout=${layout.toFixed(2)}s  nodes=${b.Nodes}`,
  );
}

const h = await page.evaluate(() => document.body.scrollHeight);
await busy("hero", 0);
await busy("anomaly", 4600);
await busy("shader", h - 1600);

await browser.close();
