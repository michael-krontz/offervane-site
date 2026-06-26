// OfferVane marketing site — interactions (vanilla, no framework)
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/main.css";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- scroll reveal ------------------------------------------------------ */
const reveals = document.querySelectorAll(".reveal");
reveals.forEach((el) => {
  const d = el.getAttribute("data-delay");
  if (d) el.style.setProperty("--d", d);
});

if (prefersReduced || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
}

/* ---- sticky nav shadow -------------------------------------------------- */
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- mobile menu -------------------------------------------------------- */
const toggle = document.querySelector(".nav__toggle");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll(".nav__links a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  })
);

/* ---- weathervane settle on load ---------------------------------------- */
const vane = document.querySelector(".vane");
if (vane) {
  if (prefersReduced) {
    vane.classList.add("is-set");
  } else {
    requestAnimationFrame(() => setTimeout(() => vane.classList.add("is-set"), 320));
  }
}

/* ---- closing doorway light (Problem section, scroll-tied) -------------- */
const doorlight = document.querySelector(".doorlight__svg");
const problemTop = document.querySelector(".problem__top");
if (doorlight && problemTop) {
  const slit = doorlight.querySelector(".doorlight__slit");
  const wedge = doorlight.querySelector(".doorlight__beam");
  const lerp = (a, b, t) => a + (b - a) * t;

  // Animate SVG attributes directly (viewBox 360x340). At p=1 the slit + wedge
  // collapse to a ~2-4px sliver under the slit, then the whole thing fades out.
  const apply = (p) => {
    const sx = lerp(315, 369, p);        // slit left edge (narrows toward center; height stays 220)
    const sw = lerp(110, 2, p);          // slit width  (110 -> 2; closed sliver keeps full height)
    const blx = lerp(15, 369, p);        // wedge bottom-left  -> converges under slit
    const brx = lerp(375, 371, p);       // wedge bottom-right -> converges under slit
    slit.setAttribute("x", sx.toFixed(2));
    slit.setAttribute("width", sw.toFixed(2));
    // top edge tracks the slit (y=220); bottom edge converges to the slit's landing point (y=370)
    wedge.setAttribute(
      "points",
      `${sx.toFixed(2)},220 ${(sx + sw).toFixed(2)},220 ${brx.toFixed(2)},370 ${blx.toFixed(2)},370`
    );
    const fade = p < 0.9 ? 1 : 1 - (p - 0.9) / 0.1; // fade whole composite over the final 10%
    doorlight.style.opacity = fade.toFixed(3);
  };

  if (prefersReduced) {
    apply(0.5); // static mid-state, no scroll binding
  } else {
    let ticking = false;
    let active = true;

    const update = () => {
      ticking = false;
      if (!active) return;
      const r = problemTop.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = vh + r.height; // travel: block top at viewport bottom -> block bottom at viewport top
      const p = total > 0 ? (vh - r.top) / total : 0;
      apply(Math.max(0, Math.min(1, p)));
    };
    const queue = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            active = e.isIntersecting;
            if (active) update();
          }),
        { rootMargin: "120px 0px 120px 0px" }
      );
      io.observe(problemTop);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    update(); // initial state
  }
}

/* ---- afternoon sun descending toward the horizon (How it works) -------- */
const sunset = document.querySelector(".sunset__svg");
const sun = sunset && sunset.querySelector(".sunset__sun");
const howTop = document.querySelector(".how__top");
if (sunset && sun && howTop) {
  const CY0 = 120;  // progress 0: sun high, clearly above the horizon
  const CY1 = 312;  // progress 1: sun center exactly on the horizon line (bisected by the mask)

  const applySun = (p) => {
    sun.setAttribute("cy", (CY0 + (CY1 - CY0) * p).toFixed(2));
  };

  if (prefersReduced) {
    applySun(0.5); // static mid-descent, no scroll binding
  } else {
    let ticking = false;
    let active = true;

    const update = () => {
      ticking = false;
      if (!active) return;
      const r = howTop.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = vh + r.height;
      const p = total > 0 ? (vh - r.top) / total : 0;
      applySun(Math.max(0, Math.min(1, p)));
    };
    const queue = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            active = e.isIntersecting;
            if (active) update();
          }),
        { rootMargin: "120px 0px 120px 0px" }
      );
      io.observe(howTop);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    update();
  }
}

/* ---- offer-rule slider sweep (Tune the offer, scroll-tied) ------------- */
const ruleSlider = document.querySelector("[data-rule-slider]");
const ruleReadout = document.querySelector("[data-rule-readout]");
const rulesRef = document.querySelector(".rules");
if (ruleSlider && ruleReadout && rulesRef) {
  // progress -> ARV multiplier %: two linear segments (0 -> 50, 0.5 -> 90, 1 -> 70)
  // Wide swing for drama: 40 points up then 20 back down, sweeping most of the track.
  const valueAt = (p) =>
    p < 0.5 ? 50 + (90 - 50) * (p / 0.5) : 90 + (70 - 90) * ((p - 0.5) / 0.5);

  const applyRule = (p) => {
    const v = valueAt(p);
    ruleSlider.style.setProperty("--p", v.toFixed(2) + "%"); // fill width + knob position (inherit --p)
    ruleReadout.textContent = Math.round(v) + "%";           // whole-number readout
  };

  if (prefersReduced) {
    applyRule(1); // static resting state: 70%
  } else {
    let ticking = false;
    let active = true;

    const update = () => {
      ticking = false;
      if (!active) return;
      const r = rulesRef.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = vh + r.height;
      const p = total > 0 ? (vh - r.top) / total : 0;
      applyRule(Math.max(0, Math.min(1, p)));
    };
    const queue = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            active = e.isIntersecting;
            if (active) update();
          }),
        { rootMargin: "120px 0px 120px 0px" }
      );
      io.observe(rulesRef);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    update();
  }
}

/* ---- Easy install: YOUR_INVESTOR_ID typewriter (scroll-tied) ------------ */
/* The only animation in this section. As the card scrolls into view the token
   types in one character at a time (textContent = growing substring), finishing
   around mid-section, then the caret just blinks. The Copy button stays in its
   default state throughout — no scroll-tied animation on it. */
const snippet = document.querySelector(".snippet");
const copyBtn = snippet && snippet.querySelector("[data-copy]");
const typeId = snippet && snippet.querySelector("[data-typeid]");
if (snippet && copyBtn) {
  const FULL_ID = typeId ? typeId.dataset.full : "";
  const TYPE_START = 0.05; // empty (just the cursor) before this
  const TYPE_END = 0.55;   // fully typed by mid-section; caret blinks through the hold

  // Canonical snippet text for copy — stable regardless of the typewriter state
  // (mirrors the markup; keep in sync if the snippet changes).
  const SNIPPET_TEXT = [
    "<!-- 1. Where the form should appear -->",
    '<div id="offervane-form"></div>',
    "",
    "<!-- 2. Load OfferVane and mount it -->",
    '<script src="https://embed.offervane.com/widget.js"></script>',
    "<script>",
    "  OfferVaneLib.mount('offervane-form', 'YOUR_INVESTOR_ID')",
    "</script>",
  ].join("\n");

  // real Copy click: standard copy-to-clipboard feedback (not scroll-tied)
  let copyTimer = 0;
  copyBtn.addEventListener("click", () => {
    navigator.clipboard?.writeText(SNIPPET_TEXT).catch(() => {});
    copyBtn.classList.add("is-copied");
    copyBtn.textContent = "Copied";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyBtn.classList.remove("is-copied");
      copyBtn.textContent = "Copy";
    }, 1600);
  });

  if (typeId) {
    const applyType = (p) => {
      const t = Math.max(0, Math.min(1, (p - TYPE_START) / (TYPE_END - TYPE_START)));
      typeId.textContent = FULL_ID.substring(0, Math.floor(t * FULL_ID.length));
    };

    if (prefersReduced) {
      typeId.textContent = FULL_ID; // full id shown, no typing, no caret
    } else {
      snippet.classList.add("snippet--anim"); // enables the blinking caret
      typeId.textContent = "";                // start empty (update() fills per scroll)
      let ticking = false;
      let active = true;

      const sync = () => {
        const r = snippet.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // progress as the card rises from near the viewport bottom to near the top
        const START = 0.92 * vh;
        const END = 0.12 * vh;
        applyType(Math.max(0, Math.min(1, (START - r.top) / (START - END))));
      };
      const update = () => {
        ticking = false;
        if (active) sync();
      };
      const queue = () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              active = e.isIntersecting;
              if (active) update();
            }),
          { rootMargin: "120px 0px 120px 0px" }
        );
        io.observe(snippet);
      }
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue, { passive: true });
      update();
    }
  }
}
