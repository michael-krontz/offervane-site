// OfferVane signup endpoint (Cloudflare Worker).
//
// Receives the /trial form POST from the marketing site, stores every signup
// in KV, then emails Michael. Mirrors the dashboard's notify() rule: the email
// is best-effort and NEVER blocks or loses a signup. Without RESEND_API_KEY it
// logs the would-be email and no-ops; the signup is already safe in KV.
//
// Bindings (see deploy.sh):
//   SIGNUPS         KV namespace "offervane-signups"
//   NOTIFY_TO       plain text, where the notification email goes
//   RESEND_API_KEY  secret, set once via the Cloudflare dashboard or wrangler

const ALLOWED_ORIGINS = new Set([
  "https://offervane.com",
  "https://www.offervane.com",
  "https://michael-krontz.github.io",
  // local dev / preview
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4317",
  "http://127.0.0.1:4317",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

const cors = (origin) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://offervane.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const json = (status, body, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method === "GET") {
      return new Response("offervane-signup: up", { status: 200 });
    }
    if (request.method !== "POST") {
      return json(405, { ok: false, error: "method not allowed" }, origin);
    }

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 10_000) return json(413, { ok: false, error: "too large" }, origin);
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "bad json" }, origin);
    }

    const rec = {
      name: clean(body.name, 200),
      email: clean(body.email, 200),
      business: clean(body.business, 200),
      website: clean(body.website, 300),
      market: clean(body.market, 2000),
      src: clean(body.src, 40) || "unknown",
      ts: new Date().toISOString(),
      ip: request.headers.get("CF-Connecting-IP") || "",
      ua: clean(request.headers.get("User-Agent") || "", 300),
      origin,
    };

    // Honeypot: the form has a hidden "phone" input humans never see or fill.
    // A non-empty value means a bot; store it flagged (visibility) but skip
    // validation and never email about it.
    const spam = clean(body.phone, 200) !== "";

    if (!spam) {
      if (!rec.name || !rec.email || !rec.business || !rec.website) {
        return json(422, { ok: false, error: "missing required fields" }, origin);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email)) {
        return json(422, { ok: false, error: "invalid email" }, origin);
      }
    }

    const key = `${spam ? "spam" : "signup"}:${rec.ts}:${crypto.randomUUID().slice(0, 8)}`;
    await env.SIGNUPS.put(key, JSON.stringify(rec, null, 2));

    if (!spam) await notify(env, rec);

    return json(200, { ok: true }, origin);
  },
};

// Best-effort email via Resend. Never throws.
async function notify(env, rec) {
  const to = env.NOTIFY_TO || "michaelkrontz@gmail.com";
  const subject = `OfferVane trial signup: ${rec.name} (${rec.business})`;
  const text = [
    `New founding-member trial request from the marketing site.`,
    ``,
    `Name:      ${rec.name}`,
    `Email:     ${rec.email}`,
    `Business:  ${rec.business}`,
    `Website:   ${rec.website}`,
    `Deal size / market:`,
    `  ${rec.market || "(not provided)"}`,
    ``,
    `Source CTA: ${rec.src}`,
    `Submitted:  ${rec.ts}`,
    ``,
    `Reply to this email to reach them directly.`,
  ].join("\n");

  try {
    if (!env.RESEND_API_KEY) {
      console.log(`[notify] no RESEND_API_KEY, log-only. to=${to} subject="${subject}"`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || "OfferVane <onboarding@resend.dev>",
        to: [to],
        reply_to: rec.email,
        subject,
        text,
      }),
    });
    console.log(`[notify] resend status=${res.status}`);
  } catch (e) {
    console.log(`[notify] error: ${e}`);
  }
}
