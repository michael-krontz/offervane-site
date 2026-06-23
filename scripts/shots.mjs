import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;

const SITE = "http://127.0.0.1:4317/";
const OUT = "/home/michael/offervane-shots";
const OG_SRC = "file:///home/michael/offervane-site/.ogsrc/og.html";
const OG_OUT = "/home/michael/offervane-site/public/og.png";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch();

// sections to capture as focused element shots
const SECTIONS = [
  ["hero", ".hero"],
  ["problem", "#problem"],
  ["how-it-works", "#how"],
  ["proof", "#math"],
  ["rules", "#rules"],
  ["install", "#install"],
  ["pricing", "#pricing"],
  ["founder", "#founder"],
  ["finalcta", ".finalcta"],
];

async function capture(label, width, height, dpr) {
  const page = await b.newPage({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  await page.goto(SITE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // trigger all reveals + vane settle, then disable animations for clean caps
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
    document.querySelector(".vane")?.classList.add("is-set");
  });
  await sleep(900);

  // full-page
  await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });

  // hide sticky nav so it doesn't overlap focused section headings
  await page.evaluate(() => {
    const n = document.querySelector(".nav");
    if (n) n.style.visibility = "hidden";
  });

  // focused section shots
  for (const [name, sel] of SECTIONS) {
    const el = await page.$(sel);
    if (!el) continue;
    await el.scrollIntoViewIfNeeded();
    await sleep(250);
    await el.screenshot({ path: `${OUT}/${label}-${name}.png` });
  }
  await page.close();
  console.log(`captured ${label} (${width}x${height})`);
}

// desktop + mobile
await capture("desktop", 1440, 900, 2);
await capture("mobile", 390, 844, 3);

// OG image
const og = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto(OG_SRC, { waitUntil: "networkidle" });
await og.evaluate(() => document.fonts.ready);
await sleep(500);
await og.screenshot({ path: OG_OUT });
console.log("captured og.png");

await b.close();
console.log("done");
