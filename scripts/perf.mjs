import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\moksh\\AppData\\Local\\Temp\\shots\\";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();

// Count how many rAF loops + how busy the main thread is by sampling rAF FPS.
const measureFps = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames++;
          if (performance.now() - start < 2000) requestAnimationFrame(tick);
          else resolve(Math.round((frames / (performance.now() - start)) * 1000));
        };
        requestAnimationFrame(tick);
      }),
  );

await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 45000 });
await sleep(3500);

const h = await page.evaluate(() => document.body.scrollHeight);

await page.evaluate(() => window.scrollTo(0, 0));
await sleep(1200);
const fpsHero = await measureFps();
await page.screenshot({ path: OUT + "perf-hero.png" });

await page.evaluate((y) => window.scrollTo(0, y), 4600);
await sleep(1200);
const fpsAnomaly = await measureFps();

await page.evaluate((y) => window.scrollTo(0, y), h - 1600);
await sleep(1200);
const fpsShader = await measureFps();
await page.screenshot({ path: OUT + "perf-shader.png" });

console.log(JSON.stringify({ scrollHeight: h, fpsHero, fpsAnomaly, fpsShader }, null, 2));

await browser.close();
