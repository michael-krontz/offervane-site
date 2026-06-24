import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;
const b = await chromium.launch();

// 1) mobile: doorlight hidden
const m = await b.newPage({ viewport: { width: 390, height: 800 } });
await m.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
const mobileDisplay = await m.evaluate(() => getComputedStyle(document.querySelector(".doorlight")).display);
const tablet = await b.newPage({ viewport: { width: 820, height: 900 } });
await tablet.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
const tabletDisplay = await tablet.evaluate(() => getComputedStyle(document.querySelector(".doorlight")).display);
const tabletCols = await tablet.evaluate(() => getComputedStyle(document.querySelector(".problem__top")).gridTemplateColumns);

// 2) reduced motion: static mid-state, no listener-driven change on scroll
const rm = await b.newContext({ reducedMotion: "reduce" });
const rp = await rm.newPage({ viewport: { width: 1440, height: 900 } });
await rp.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
await rp.evaluate(() => document.querySelector("#problem").scrollIntoView());
await new Promise(r=>setTimeout(r,200));
const before = await rp.evaluate(() => getComputedStyle(document.querySelector(".doorlight__svg")).transform);
await rp.evaluate(() => window.scrollBy(0, 400));
await new Promise(r=>setTimeout(r,200));
const after = await rp.evaluate(() => getComputedStyle(document.querySelector(".doorlight__svg")).transform);

console.log(JSON.stringify({
  mobile_display: mobileDisplay,          // expect "none"
  tablet_display: tabletDisplay,          // expect "block"
  tablet_cols: tabletCols,                // expect a 2-col (smaller right) grid
  reducedMotion_transform_before: before, // expect ~scaleX(0.51)
  reducedMotion_transform_after_scroll: after, // expect UNCHANGED (no animation)
}, null, 2));
await b.close();
