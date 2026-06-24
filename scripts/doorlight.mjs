import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")));

// place .problem__top top at a given fraction of the viewport height, then sample
async function sample(label, topFracOfVh) {
  const data = await p.evaluate((frac) => {
    const top = document.querySelector(".problem__top");
    const vh = window.innerHeight;
    const targetTop = vh * frac; // desired rect.top
    const curTop = top.getBoundingClientRect().top;
    window.scrollBy(0, curTop - targetTop);
    return null;
  }, topFracOfVh);
  await new Promise((r) => setTimeout(r, 200));
  const m = await p.evaluate(() => {
    const svg = document.querySelector(".doorlight__svg");
    const r = document.querySelector(".problem__top").getBoundingClientRect();
    const vh = window.innerHeight;
    const total = vh + r.height;
    const prog = Math.max(0, Math.min(1, (vh - r.top) / total));
    const cs = getComputedStyle(svg);
    return { progress: +prog.toFixed(2), transform: cs.transform, opacity: cs.opacity };
  });
  console.log(label, JSON.stringify(m));
  await (await p.$(".problem__top")).screenshot({ path: `/home/michael/offervane-shots/DL-${label}.png` });
}

await sample("p0", 1.0);   // block top at viewport bottom -> progress ~0
await sample("p_mid", 0.35);
await sample("p_high", -0.4); // block scrolled up past top -> progress ~1
await b.close();
console.log("done");
