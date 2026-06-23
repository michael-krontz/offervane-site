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
