import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
await p.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")));

async function place(frac) {
  await p.evaluate((f) => {
    const top = document.querySelector(".problem__top");
    window.scrollBy(0, top.getBoundingClientRect().top - window.innerHeight * f);
  }, frac);
  await new Promise((r) => setTimeout(r, 200));
  return p.evaluate(() => {
    const svg = document.querySelector(".doorlight__svg");
    const r = document.querySelector(".problem__top").getBoundingClientRect();
    const vh = window.innerHeight, total = vh + r.height;
    const prog = Math.max(0, Math.min(1, (vh - r.top) / total));
    const cs = getComputedStyle(svg);
    return { progress: +prog.toFixed(2), scaleX: +cs.transform.split(",")[0].replace("matrix(","").trim().toFixed?.(3) || cs.transform, opacity: +cs.opacity };
  });
}

// near-open view for the visual (progress ~0.12 so trapezoid clearly visible)
console.log("visual", JSON.stringify(await place(0.85)));
await (await p.$(".problem__top")).screenshot({ path: "/home/michael/offervane-shots/DL-open.png" });
console.log("mid",    JSON.stringify(await place(0.3)));
await (await p.$(".problem__top")).screenshot({ path: "/home/michael/offervane-shots/DL-mid.png" });
// push very high to exceed 0.9 and confirm opacity fade
console.log("fade1", JSON.stringify(await place(-0.7)));
console.log("fade2", JSON.stringify(await place(-1.1)));
await b.close();
