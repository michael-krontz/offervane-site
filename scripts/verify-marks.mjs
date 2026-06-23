import pkg from "/home/michael/scratch/pw/node_modules/playwright/index.js";
const { chromium } = pkg;
const OUT = "/home/michael/offervane-shots";
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")));
await new Promise((r) => setTimeout(r, 400));

await (await page.$(".nav")).screenshot({ path: `${OUT}/v-nav.png` });

await (await page.$(".footer")).scrollIntoViewIfNeeded();
await new Promise((r) => setTimeout(r, 200));
await (await page.$(".footer")).screenshot({ path: `${OUT}/v-footer.png` });

await (await page.$(".finalcta")).scrollIntoViewIfNeeded();
await new Promise((r) => setTimeout(r, 200));
await (await page.$(".finalcta")).screenshot({ path: `${OUT}/v-finalcta.png` });

const out = await page.evaluate(() => ({
  hasHeroPill: !!document.querySelector(".hero .tick"),
  logomarkSymbolDefined: !!document.querySelector("#ov-logomark"),
  useReferences: document.querySelectorAll('use[href="#ov-logomark"]').length,
  installHasRealEmbed: document.body.innerHTML.includes("OfferVaneLib.mount"),
  installHasOldKey: document.body.innerHTML.includes("data-key"),
  controlsHasMaxPrice: document.body.innerHTML.includes("Max purchase"),
  controlsHasMinSpread: document.body.innerHTML.includes("Minimum spread"),
  founderName: document.querySelector(".founder__name")?.textContent.trim(),
}));
console.log(JSON.stringify(out, null, 2));
await b.close();
