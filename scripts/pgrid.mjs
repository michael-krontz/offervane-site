import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;
const b = await chromium.launch();
for (const [label, w, h, dpr] of [["desktop", 1440, 900, 2], ["mid", 960, 900, 2], ["mobile", 390, 1000, 3]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")));
  await (await p.$("#pricing")).scrollIntoViewIfNeeded();
  await new Promise((r) => setTimeout(r, 300));
  await p.evaluate(() => { const n = document.querySelector(".nav"); if (n) n.style.visibility = "hidden"; });
  const info = await p.evaluate(() => {
    const h2 = document.querySelector("#pricing .section__h");
    const lh = parseFloat(getComputedStyle(h2).lineHeight);
    const grid = document.querySelector(".pricing");
    const cols = getComputedStyle(grid).gridTemplateColumns;
    return {
      h2Lines: Math.round(h2.getBoundingClientRect().height / lh),
      h2FontPx: Math.round(parseFloat(getComputedStyle(h2).fontSize)),
      gridCols: cols,
    };
  });
  console.log(label, JSON.stringify(info));
  await (await p.$("#pricing")).screenshot({ path: `/home/michael/offervane-shots/PG-${label}.png` });
  await p.close();
}
await b.close();
