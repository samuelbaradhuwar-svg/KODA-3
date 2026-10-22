// The Autopilot HTTP API, as a function of its dependencies so tests can drive it without a network.
// api/autopilot/[...route].js wires the real ones. Routes (all under /api/autopilot):
//   GET|POST /tick            cron: run the job runner               (Authorization: Bearer CRON_SECRET)
//   GET|POST /approval        email links: confirm page, then decide  (signed, expiring token)
//   GET|POST /admin/*         admin page backend                      (Supabase session of an admin)
//   GET|POST /onboarding      client onboarding form                  (one-time invite token)
//   POST     /payfast-itn     payment notifications                   (PayFast signature + 3 more checks)
import { createHash, randomBytes } from "node:crypto";
import { sign, verify, safeEqual, SigningError } from "./signing.js";
import { esc, page, sendHtml } from "./html.js";
import { errorName } from "./store.js";
import { runTick } from "./runner.js";
import { verifyItn } from "./payfast.js";
import { log } from "./redact.js";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const WORDING_VERSION = "draft-0"; // the consent wording is the attorney's to approve; bump this when it changes

const FRIENDLY = {
  hash_mismatch: "The proposal changed after this link was made, so nothing was done. Open the newest approval.",
  approval_already_decided: "This was already decided.",
  approval_not_found: "That approval does not exist.",
  client_killed: "This client is switched off (kill switch), so nothing can be approved right now.",
};

function json(res, status, body) {
  res.setHeader("cache-control", "no-store");
  res.status(status).json(body);
}

function parseBody(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  if (typeof b === "string") {
    try { return JSON.parse(b); } catch { return Object.fromEntries(new URLSearchParams(b)); }
  }
  return {};
}

// PayFast signs the fields in the order received, so rebuild the body in that order.
const rawBodyOf = (req) => (typeof req.body === "string" ? req.body : new URLSearchParams(Object.entries(req.body || {}).map(([k, v]) => [k, String(v)])).toString());

export function createApi({ store, handlers, notify, env = process.env, now = () => Date.now(), getUser, resolveHosts, confirm, logger = log }) {
  const secret = () => env.APPROVAL_LINK_SECRET;
  const hits = new Map();
  const limited = (ip, max = 30) => {
    const t = now();
    const list = (hits.get(ip) || []).filter((x) => t - x < 3_600_000);
    list.push(t);
    hits.set(ip, list);
    if (hits.size > 2000) hits.clear();
    return list.length > max;
  };
  const ipOf = (req) => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const bearer = (req) => /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "")?.[1] || "";

  // ---------------------------------------------------------------- cron
  async function tick(req, res) {
    if (!env.CRON_SECRET) return json(res, 503, { ok: false, error: "CRON_SECRET is not set" });
    if (!safeEqual(bearer(req), env.CRON_SECRET)) return json(res, 401, { ok: false });
    const summary = await runTick({ store, handlers, notify, dryRun: env.AUTOPILOT_DRY_RUN === "1", now, logger });
    return json(res, 200, { ok: true, ...summary });
  }

  // ---------------------------------------------------------------- approval links
  async function approval(req, res) {
    const token = req.method === "POST" ? parseBody(req).t : new URL(req.url, "http://x").searchParams.get("t");
    let p;
    try {
      p = verify(token, secret(), { purpose: "approval", now: now() });
    } catch (e) {
      const why = e instanceof SigningError && e.code === "expired" ? "This link has expired." : "This link is not valid.";
      return sendHtml(res, 400, page("Link problem", `<h2>${why}</h2><p class="muted">Open the admin page to review pending approvals.</p>`));
    }
    const a = await store.getApproval(p.a);
    if (!a) return sendHtml(res, 404, page("Not found", "<h2>That approval does not exist.</h2>"));

    if (req.method === "POST") {
      try {
        const r = await store.decide(p.a, p.d, p.h, "admin:email-link");
        const msg = r.status === "expired" ? "This draft had already lapsed, so nothing was done." : r.status === "approved" ? "Approved. It will be carried out on the next run." : "Rejected. Nothing will be done.";
        return sendHtml(res, 200, page("Done", `<h2>${esc(msg)}</h2>`));
      } catch (e) {
        const n = errorName(e);
        return sendHtml(res, 409, page("Not done", `<h2>${esc(FRIENDLY[n] || "That could not be done.")}</h2>`));
      }
    }
    if (a.status !== "pending") return sendHtml(res, 200, page("Already decided", `<h2>This was already ${esc(a.status)}.</h2>`));
    if (a.payload_hash !== p.h) return sendHtml(res, 409, page("Changed", `<h2>${esc(FRIENDLY.hash_mismatch)}</h2>`));
    const word = p.d === "approve" ? "Approve" : "Reject";
    return sendHtml(res, 200, page(`${word}?`, `<h2>${word} this for ${esc(a.business_name)}?</h2><p class="muted">${esc(a.task_type)}. This is exactly what will be done:</p>
<pre>${esc(JSON.stringify(a.preview, null, 2))}</pre>
<form method="post" action="/api/autopilot/approval"><input type="hidden" name="t" value="${esc(token)}"><button class="${p.d === "approve" ? "ok" : "no"}" type="submit">${word}</button></form>
<p class="muted">Nothing happens until you press the button.</p>`));
  }

  // ---------------------------------------------------------------- admin
  async function admin(req, res, route) {
    const user = await getUser(bearer(req));
    const email = user?.email?.toLowerCase();
    if (!user || !user.email_confirmed_at) return json(res, 401, { ok: false, error: "Sign in again." });
    if (!(await store.isAdminEmail(email))) return json(res, 403, { ok: false, error: "Not an admin." });
    const actor = `admin:${email}`;
    const b = parseBody(req);
    const need = (cond, msg = "Check the details and try again.") => { if (!cond) throw Object.assign(new Error(msg), { status: 400 }); };

    if (route === "/admin/overview" && req.method === "GET") return json(res, 200, { ok: true, ...(await store.overview()) });
    if (req.method !== "POST") return json(res, 405, { ok: false });

    switch (route) {
      case "/admin/approval": {
        need(UUID.test(b.id) && ["approve", "reject"].includes(b.decision) && typeof b.hash === "string");
        const r = await store.decide(b.id, b.decision, b.hash, actor, String(b.note || "").slice(0, 500) || null);
        return json(res, 200, { ok: true, status: r.status });
      }
      case "/admin/kill":
        need(UUID.test(b.clientId) && typeof b.on === "boolean");
        await store.killSwitch(b.clientId, b.on, actor, String(b.reason || "").slice(0, 300) || null);
        return json(res, 200, { ok: true });
      case "/admin/client": {
        need(typeof b.businessName === "string" && b.businessName.trim() && ["presence", "growth", "performance"].includes(b.plan));
        const c = await store.createClient({ businessName: b.businessName.trim().slice(0, 200), plan: b.plan, email: b.email, contact: b.contact, website: b.website, internal: b.internal }, actor);
        return json(res, 200, { ok: true, client: { id: c.id } });
      }
      case "/admin/client-status":
        need(UUID.test(b.clientId) && ["onboarding", "active", "notice", "paused", "cancelled"].includes(b.status));
        await store.setClientStatus(b.clientId, b.status, b.noticeEnds || null, actor);
        return json(res, 200, { ok: true });
      case "/admin/automation":
        need(UUID.test(b.clientId) && typeof b.taskType === "string" && ["approve", "auto"].includes(b.mode));
        await store.setAutomation(b.clientId, b.taskType, b.mode, actor);
        return json(res, 200, { ok: true });
      case "/admin/price":
        need(UUID.test(b.clientId) && Number.isInteger(b.cents) && b.cents >= 0);
        await store.setPrice(b.clientId, b.cents, actor);
        return json(res, 200, { ok: true });
      case "/admin/invite": {
        need(UUID.test(b.clientId));
        const token = randomBytes(32).toString("base64url");
        const expires = await store.createInvite(b.clientId, sha256(token), "7 days", actor);
        return json(res, 200, { ok: true, link: `${env.APP_BASE_URL || "https://www.heykoda.co.za"}/onboarding?token=${token}`, expires });
      }
      case "/admin/selftest":
        need(UUID.test(b.clientId));
        return json(res, 200, { ok: true, taskId: await store.enqueue(b.clientId, "selftest_draft", {}, { actor }) });
      default:
        return json(res, 404, { ok: false });
    }
  }

  // ---------------------------------------------------------------- onboarding
  async function onboarding(req, res) {
    if (limited(ipOf(req))) return json(res, 429, { ok: false, error: "Too many requests. Please try again later." });
    const b = req.method === "POST" ? parseBody(req) : {};
    const token = req.method === "POST" ? b.token : new URL(req.url, "http://x").searchParams.get("token");
    if (typeof token !== "string" || token.length < 20 || token.length > 100) return json(res, 404, { ok: false, error: "This link is not valid." });
    const hash = sha256(token);
    if (req.method === "GET") {
      const info = await store.inviteInfo(hash);
      return info ? json(res, 200, { ok: true, businessName: info.business_name, plan: info.plan, wordingVersion: WORDING_VERSION }) : json(res, 404, { ok: false, error: "This link has expired or was already used." });
    }
    if (req.method !== "POST") return json(res, 405, { ok: false });
    const text = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
    const p = b.profile || {};
    const profile = {
      tone: text(p.tone, 2000), offers: text(p.offers, 4000), dos: text(p.dos, 2000), donts: text(p.donts, 2000), audience: text(p.audience, 2000), areas: text(p.areas, 2000),
      banned_claims: Array.isArray(p.banned_claims) ? p.banned_claims.filter((x) => typeof x === "string").slice(0, 50).map((x) => x.slice(0, 200)) : [],
    };
    try {
      await store.completeOnboarding(hash, profile, WORDING_VERSION, b.aiConsent === true, b.dataConsent === true);
      return json(res, 200, { ok: true });
    } catch (e) {
      const n = errorName(e);
      if (n === "consent_required") return json(res, 400, { ok: false, error: "Please tick both boxes so we can go ahead." });
      if (n === "invite_invalid") return json(res, 404, { ok: false, error: "This link has expired or was already used." });
      throw e;
    }
  }

  // ---------------------------------------------------------------- PayFast
  async function itn(req, res) {
    if (req.method !== "POST") return json(res, 405, { ok: false });
    const rawBody = rawBodyOf(req);
    const params = Object.fromEntries(new URLSearchParams(rawBody));
    const clientId = params.custom_str1;
    if (!UUID.test(clientId || "")) return json(res, 400, { ok: false });
    const expected = await store.expectedAmount(clientId);
    if (expected == null) return json(res, 400, { ok: false });
    const sandbox = env.PAYFAST_SANDBOX === "1";
    const r = await verifyItn({ rawBody, remoteIp: ipOf(req), passphrase: env.PAYFAST_PASSPHRASE || "", expectedAmountCents: expected, skipAmount: params.payment_status === "CANCELLED", sandbox, resolveHosts, confirm });
    if (!r.checks.signature) return json(res, 400, { ok: false });
    if (!r.ok) {
      await store.audit(clientId, "system", "billing.itn_rejected", { checks: r.checks, status: params.payment_status });
      logger("warn", "ITN rejected", { checks: r.checks });
      return json(res, 503, { ok: false }); // PayFast retries a non-200
    }
    if (!["COMPLETE", "FAILED", "CANCELLED"].includes(params.payment_status)) return json(res, 200, { ok: true, ignored: true });
    const result = await store.applyBilling({ provider: "payfast", paymentId: params.pf_payment_id || params.m_payment_id, status: params.payment_status, clientId, amountCents: Math.round(Number(params.amount_gross || 0) * 100), checks: r.checks });
    return json(res, 200, { ok: true, result });
  }

  // ---------------------------------------------------------------- router
  return async function handle(req, res) {
    try {
      const route = new URL(req.url, "http://x").pathname.replace(/^\/api\/autopilot/, "").replace(/\/+$/, "") || "/";
      if (route === "/tick" && ["GET", "POST"].includes(req.method)) return await tick(req, res);
      if (route === "/approval" && ["GET", "POST"].includes(req.method)) return await approval(req, res);
      if (route === "/onboarding") return await onboarding(req, res);
      if (route === "/payfast-itn") return await itn(req, res);
      if (route.startsWith("/admin/")) return await admin(req, res, route);
      return json(res, 404, { ok: false });
    } catch (e) {
      const n = errorName(e);
      logger("error", "api error", { error: String(e?.message), name: n });
      if (e?.status === 400) return json(res, 400, { ok: false, error: e.message });
      if (n && FRIENDLY[n]) return json(res, 409, { ok: false, error: FRIENDLY[n], code: n });
      if (n) return json(res, 409, { ok: false, error: n, code: n });
      return json(res, 500, { ok: false, error: "Something went wrong." }); // details stay in the server log
    }
  };
}
