// /trial signup form: reads the ?src attribution, validates inline, POSTs to
// the signup worker, and redirects to thanks/ on success. The endpoint stores
// every signup in KV and emails Michael (see worker/README.md).
const ENDPOINT = "https://offervane-signup.truecatholicai.workers.dev/";

const form = document.getElementById("trial-form");
if (form) {
  // which CTA drove the visit: /trial/?src=header|hero|pricing|testimonials|final
  form.elements.src.value = (new URLSearchParams(location.search).get("src") || "").slice(0, 40);

  const CHECKS = {
    name: (v) => v.trim() !== "",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    business: (v) => v.trim() !== "",
    website: (v) => /^\S+\.\S{2,}/.test(v.trim()), // loose on purpose: "acme.com" is fine
  };

  const setInvalid = (input, on) => {
    const fld = input.closest(".fld");
    fld.classList.toggle("is-invalid", on);
    input.setAttribute("aria-invalid", String(on));
    const err = fld.querySelector(".fld__err");
    if (err) err.hidden = !on;
  };

  // clear a field's error as soon as it's corrected
  form.addEventListener("input", (e) => {
    const check = CHECKS[e.target.name];
    if (check && check(e.target.value)) setInvalid(e.target, false);
  });

  const formErr = form.querySelector(".trialform__error");
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formErr.hidden = true;

    let firstBad = null;
    for (const [name, check] of Object.entries(CHECKS)) {
      const input = form.elements[name];
      const bad = !check(input.value);
      setInvalid(input, bad);
      if (bad && !firstBad) firstBad = input;
    }
    if (firstBad) {
      firstBad.focus();
      return;
    }

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "Sending…";

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.elements.name.value,
          email: form.elements.email.value,
          business: form.elements.business.value,
          website: form.elements.website.value,
          market: form.elements.market.value,
          src: form.elements.src.value,
          phone: form.elements.phone.value, // honeypot, empty for humans
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      location.href = "thanks/";
    } catch {
      btn.disabled = false;
      btn.textContent = label;
      formErr.hidden = false;
    }
  });
}
