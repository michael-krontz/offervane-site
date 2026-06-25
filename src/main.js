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
  const MIN_SCALE = 0.035; // progress 1 -> a few-px sliver (slit + wedge) on the desktop column

  const apply = (p) => {
    const s = 1 + (MIN_SCALE - 1) * p; // lerp 1 -> MIN_SCALE (narrows slit + wedge proportionally)
    const fade = p < 0.9 ? 1 : 1 - (p - 0.9) / 0.1; // whole composite fades out over the final 10%
    doorlight.style.transform = `scaleX(${s})`;
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

/* ---- copy button (visual placeholder — copies the snippet text) -------- */
const snippetCode = document.querySelector(".snippet__code code");
document.querySelector("[data-copy]")?.addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const text = snippetCode ? snippetCode.innerText : "";
  navigator.clipboard?.writeText(text).catch(() => {});
  const prev = btn.textContent;
  btn.textContent = "Copied";
  btn.classList.add("is-copied");
  setTimeout(() => {
    btn.textContent = prev;
    btn.classList.remove("is-copied");
  }, 1600);
});
