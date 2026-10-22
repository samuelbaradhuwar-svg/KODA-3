import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { newDb, mkClient } from "./helpers/db.mjs";
import { pgliteRpc } from "./helpers/rpc.mjs";
import { createStore } from "../lib/store.js";
import { runTick, RetryableError, PermanentError } from "../lib/runner.js";
import { createApi } from "../lib/api.js";
import { createNotifier, approvalLinks } from "../lib/notify.js";
import { handlers as realHandlers } from "../jobs/index.js";
import { itnSignature } from "../lib/payfast.js";

const quiet = () => {};
const ENV = { CRON_SECRET: "cron-secret-123", APPROVAL_LINK_SECRET: "link-secret-456", ADMIN_EMAIL: "boss@example.co.za", APP_BASE_URL: "https://test.example", PAYFAST_PASSPHRASE: "pass phrase" };

async function setup({ handlers = realHandlers, env = ENV, users = {} } = {}) {
  const db = await newDb();
  const store = createStore(pgliteRpc(db));
  const sent = [];
  const sendEmail = async (m) => { sent.push(m); return { ok: true }; };
  const notify = createNotifier({ sendEmail, env });
  const PF_IP = "197.97.145.144";
  const api = createApi({
    store, handlers, notify, env, logger: quiet,
    getUser: async (token) => users[token] || null,
    resolveHosts: async () => [PF_IP], confirm: async () => true,
  });
  const client = await mkClient(db, { internal: true, name: "KODA" });
  const q = async (sql, p) => (await db.query(sql, p)).rows;
  return { db, store, sent, notify, api, client, q, PF_IP };
}

function call(api, { method = "GET", url, headers = {}, body, ip = "9.9.9.9" }) {
  return new Promise((resolve, reject) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, status(c) { this.code = c; return this; },
      json(o) { resolve({ code: this.code, body: o, headers: this.headers }); }, send(t) { resolve({ code: this.code, text: t, headers: this.headers }); } };
    api({ method, url, headers: { "x-forwarded-for": ip, ...headers }, body, socket: {} }, res).catch(reject);
  });
}
const tick = (s, over = {}) => runTick({ store: s.store, handlers: over.handlers || realHandlers, notify: s.notify, logger: quiet, ...over });
const linkFrom = (html, which) => new RegExp(`href="([^"]+)"[^>]*>(?:<b>)?Review and ${which}`).exec(html)[1].replace(/&amp;/g, "&");
const state = async (s, id) => (await s.q(`select state, last_error, attempts, result from ap_tasks where id=$1`, [id]))[0];

// ------------------------------------------------------------------ the runner
test("tick: draft, ask a human, wait, then execute only what was approved", async () => {
  const s = await setup();
  const id = await s.store.enqueue(s.client, "selftest_draft");
  let r = await tick(s);
  assert.equal(r.awaiting, 1);
  assert.equal(s.sent.length, 1, "the admin was emailed");
  assert.match(s.sent[0].html, /Review and approve/);
  assert.equal((await state(s, id)).state, "awaiting_approval");
  r = await tick(s);
  assert.equal(r.processed, 0, "nothing happens while waiting");

  const [a] = await s.q(`select * from ap_approvals`);
  await s.store.decide(a.id, "approve", a.payload_hash, "admin:test");
  r = await tick(s);
  assert.equal(r.done, 1);
  const t = await state(s, id);
  assert.equal(t.state, "done");
  assert.equal(t.result.executed, true);
  assert.equal((await s.q(`select ap_verify_audit_chain() v`))[0].v, null);
});

test("tick: heartbeat needs no approval; a side-effect task cannot skip it", async () => {
  const s = await setup({ handlers: { ...realHandlers, sneaky: { draft: async () => ({ done: { sneaky: true } }) } } });
  const hb = await s.store.enqueue(s.client, "heartbeat");
  await s.db.exec(`insert into ap_task_policy values ('sneaky', true, false)`);
  const sneaky = await s.store.enqueue(s.client, "sneaky");
  const r = await tick(s, { handlers: { ...realHandlers, sneaky: { draft: async () => ({ done: { sneaky: true } }) } } });
  assert.equal((await state(s, hb)).state, "done");
  const t = await state(s, sneaky);
  assert.equal(t.state, "failed");
  assert.match(t.last_error, /side_effect_task_cannot_finish/);
  assert.equal(r.failed, 1);
});

test("auto mode runs straight through; dry run never calls execute", async () => {
  const s = await setup();
  await s.store.setAutomation(s.client, "selftest_draft", "auto", "admin:test");
  const id = await s.store.enqueue(s.client, "selftest_draft");
  await tick(s);
  assert.equal((await state(s, id)).state, "done");
  assert.equal(s.sent.length, 0, "no approval email in auto mode");

  let executed = 0;
  const spy = { selftest_draft: { draft: realHandlers.selftest_draft.draft, execute: async () => { executed++; return {}; } } };
  const id2 = await s.store.enqueue(s.client, "selftest_draft");
  const r = await tick(s, { handlers: spy, dryRun: true });
  assert.equal(executed, 0);
  const t = await state(s, id2);
  assert.equal(t.state, "done");
  assert.equal(t.result.dry_run, true);
  assert.equal(r.dryRun, true);
});

test("kill switch pulled during a step: nothing is approved or executed, the task is put back", async () => {
  const s = await setup();
  const h = { selftest_draft: { draft: async ({ task, store }) => { await store.killSwitch(task.client_id, true, "admin:test", "stop"); return { propose: { text: "x" } }; } } };
  const id = await s.store.enqueue(s.client, "selftest_draft");
  await tick(s, { handlers: h });
  const t = await state(s, id);
  assert.equal(t.state, "queued");
  assert.equal(t.last_error, "client_killed");
  assert.equal((await s.q(`select count(*)::int n from ap_approvals`))[0].n, 0);
  assert.equal(s.sent.length, 0);
});

test("errors: retry, permanent failure, unknown task types, and giving up", async () => {
  const s = await setup();
  let n = 0;
  const h = {
    heartbeat: { draft: async () => { n++; throw new RetryableError("flaky", "1 hour"); } },
    selftest_draft: { draft: async () => { throw new PermanentError("bad input"); } },
  };
  const hb = await s.store.enqueue(s.client, "heartbeat");
  const perm = await s.store.enqueue(s.client, "selftest_draft");
  const unknown = await s.store.enqueue(s.client, "report");
  await tick(s, { handlers: h });
  assert.equal((await state(s, perm)).state, "failed");
  assert.match((await state(s, unknown)).last_error, /no_handler/);
  assert.equal((await state(s, hb)).state, "queued", "waits for its retry time");
  const later = () => s.db.exec(`update ap_tasks set run_after = now() where state = 'queued'`);
  await later();
  await tick(s, { handlers: h });
  await later();
  await tick(s, { handlers: h });
  const t = await state(s, hb);
  assert.equal(t.state, "failed", "gives up after the attempts are used");
  assert.equal(n, 3);
});

test("a crash during execute is retried, and the retry still uses the approved payload", async () => {
  const s = await setup();
  let calls = 0;
  const seen = [];
  const h = { selftest_draft: { draft: realHandlers.selftest_draft.draft, execute: async ({ payload, idempotencyKey }) => { seen.push([payload.text, idempotencyKey]); if (++calls === 1) throw new RetryableError("network", "1 hour"); return { ok: true }; } } };
  const id = await s.store.enqueue(s.client, "selftest_draft");
  await tick(s, { handlers: h });
  const [a] = await s.q(`select * from ap_approvals`);
  await s.store.decide(a.id, "approve", a.payload_hash, "admin:test");
  await tick(s, { handlers: h });
  assert.equal((await state(s, id)).state, "approved", "put back after the failed attempt");
  await s.db.exec(`update ap_tasks set run_after = now() where state = 'approved'`);
  await tick(s, { handlers: h });
  assert.equal((await state(s, id)).state, "done");
  assert.equal(seen.length, 2);
  assert.deepEqual(seen[0], seen[1], "same payload and same idempotency key both times");
});

test("an email failure does not lose the approval", async () => {
  const s = await setup();
  const failing = { approvalRequested: async () => { throw new Error("resend down"); } };
  const id = await s.store.enqueue(s.client, "selftest_draft");
  await tick(s, { notify: failing });
  assert.equal((await state(s, id)).state, "awaiting_approval");
  assert.equal((await s.q(`select count(*)::int n from ap_approvals where status='pending'`))[0].n, 1);
});

test("clients who are not paid up are not worked on", async () => {
  const s = await setup();
  const unpaid = await mkClient(s.db, { billing: "none", name: "Unpaid" });
  const id = await s.store.enqueue(unpaid, "heartbeat");
  const r = await tick(s);
  assert.equal(r.processed, 0);
  assert.equal((await state(s, id)).state, "queued");
});

// ------------------------------------------------------------------ cron endpoint
test("tick endpoint: refuses without the secret, runs with it", async () => {
  const s = await setup();
  await s.store.enqueue(s.client, "heartbeat");
  assert.equal((await call(s.api, { url: "/api/autopilot/tick" })).code, 401);
  assert.equal((await call(s.api, { url: "/api/autopilot/tick", headers: { authorization: "Bearer nope" } })).code, 401);
  const noSecret = await setup({ env: { ...ENV, CRON_SECRET: "" } });
  assert.equal((await call(noSecret.api, { url: "/api/autopilot/tick", headers: { authorization: "Bearer " } })).code, 503);
  const ok = await call(s.api, { url: "/api/autopilot/tick", headers: { authorization: `Bearer ${ENV.CRON_SECRET}` } });
  assert.equal(ok.code, 200);
  assert.equal(ok.body.done, 1);
  assert.equal((await call(s.api, { method: "POST", url: "/api/autopilot/tick", headers: { authorization: `Bearer ${ENV.CRON_SECRET}` } })).code, 200);
});

// ------------------------------------------------------------------ email approval links
test("email links: opening changes nothing, the button decides, and replays are refused", async () => {
  const s = await setup();
  await s.store.enqueue(s.client, "selftest_draft");
  await tick(s);
  const approve = linkFrom(s.sent[0].html, "approve");

  const open = await call(s.api, { url: approve.replace("https://test.example", "") });
  assert.equal(open.code, 200);
  assert.match(open.text, /exactly what will be done/);
  assert.match(open.text, /self-test post/);
  assert.match(open.headers["content-security-policy"], /default-src 'none'/);
  assert.equal((await s.q(`select status from ap_approvals`))[0].status, "pending", "a GET never decides");

  const t = new URL(approve).searchParams.get("t");
  const done = await call(s.api, { method: "POST", url: "/api/autopilot/approval", body: new URLSearchParams({ t }).toString() });
  assert.equal(done.code, 200);
  assert.match(done.text, /Approved/);
  assert.equal((await s.q(`select status, decided_by from ap_approvals`))[0].decided_by, "admin:email-link");
  const again = await call(s.api, { method: "POST", url: "/api/autopilot/approval", body: { t } });
  assert.equal(again.code, 409);
  assert.match(again.text, /already decided/);
});

test("email links: tampered, expired, wrong-purpose and killed-client links do nothing", async () => {
  const s = await setup();
  await s.store.enqueue(s.client, "selftest_draft");
  await tick(s);
  const [a] = await s.q(`select * from ap_approvals`);
  const good = new URL(linkFrom(s.sent[0].html, "approve")).searchParams.get("t");
  const bad = [
    good.slice(0, -3) + "AAA",
    approvalLinks({ approval: a, secret: "different-secret", baseUrl: "x" }).approve.split("t=")[1],
    approvalLinks({ approval: { ...a, expires_at: new Date(Date.now() + 5 * 86400_000) }, secret: ENV.APPROVAL_LINK_SECRET, baseUrl: "x", now: Date.now() - 30 * 86400_000 }).approve.split("t=")[1], // already expired
    "",
  ];
  for (const t of bad) {
    const r = await call(s.api, { method: "POST", url: "/api/autopilot/approval", body: { t } });
    assert.equal(r.code, 400, t.slice(0, 20));
  }
  assert.equal((await s.q(`select status from ap_approvals`))[0].status, "pending");

  await s.store.killSwitch(s.client, true, "admin:test");
  const r = await call(s.api, { method: "POST", url: "/api/autopilot/approval", body: { t: good } });
  assert.equal(r.code, 409);
  assert.match(r.text, /kill switch/);
  assert.equal((await s.q(`select status from ap_approvals`))[0].status, "pending");
});

test("a link for an old proposal is refused once the proposal has changed", async () => {
  const s = await setup();
  await s.store.enqueue(s.client, "selftest_draft");
  await tick(s);
  const t = new URL(linkFrom(s.sent[0].html, "approve")).searchParams.get("t");
  await s.db.exec(`update ap_approvals set payload_hash = 'something-else'`);
  const r = await call(s.api, { method: "POST", url: "/api/autopilot/approval", body: { t } });
  assert.equal(r.code, 409);
  assert.match(r.text, /changed/);
});

// ------------------------------------------------------------------ admin API
const ADMIN = { "Bearer good": { email: "Boss@Example.co.za", email_confirmed_at: "2026-01-01" }, "Bearer unconfirmed": { email: "boss@example.co.za" }, "Bearer stranger": { email: "x@example.co.za", email_confirmed_at: "2026-01-01" } };
const asUser = (name) => ({ authorization: name });

test("admin API: only a confirmed, listed admin gets in", async () => {
  const s = await setup({ users: { good: ADMIN["Bearer good"], unconfirmed: ADMIN["Bearer unconfirmed"], stranger: ADMIN["Bearer stranger"] } });
  await s.db.exec(`insert into ap_admins values ('boss@example.co.za')`);
  const get = (h) => call(s.api, { url: "/api/autopilot/admin/overview", headers: h });
  assert.equal((await get({})).code, 401);
  assert.equal((await get(asUser("Bearer nobody"))).code, 401);
  assert.equal((await get(asUser("Bearer unconfirmed"))).code, 401);
  assert.equal((await get(asUser("Bearer stranger"))).code, 403);
  const ok = await get(asUser("Bearer good"));
  assert.equal(ok.code, 200);
  assert.equal(ok.body.clients.length, 1);
  assert.equal(ok.body.audit_chain_ok, true);
  // writes need the same
  assert.equal((await call(s.api, { method: "POST", url: "/api/autopilot/admin/kill", headers: asUser("Bearer stranger"), body: { clientId: s.client, on: true } })).code, 403);
  assert.equal((await s.q(`select kill_switch from ap_clients`))[0].kill_switch, false);
});

test("admin API: approve in the page, kill switch, automation limits, create client, invite and onboarding", async () => {
  const s = await setup({ users: { good: ADMIN["Bearer good"] } });
  await s.db.exec(`insert into ap_admins values ('boss@example.co.za')`);
  const h = asUser("Bearer good");
  const post = (route, body) => call(s.api, { method: "POST", url: `/api/autopilot/admin/${route}`, headers: h, body });

  await s.store.enqueue(s.client, "selftest_draft");
  await tick(s);
  const [a] = await s.q(`select * from ap_approvals`);
  assert.equal((await post("approval", { id: a.id, decision: "approve", hash: "wrong" })).body.code, "hash_mismatch");
  const ok = await post("approval", { id: a.id, decision: "approve", hash: a.payload_hash, note: "ok" });
  assert.equal(ok.body.status, "approved");
  assert.equal((await s.q(`select decided_by from ap_approvals`))[0].decided_by, "admin:boss@example.co.za");

  assert.equal((await post("kill", { clientId: s.client, on: true, reason: "test" })).code, 200);
  assert.equal((await s.q(`select kill_switch from ap_clients`))[0].kill_switch, true);
  await post("kill", { clientId: s.client, on: false });

  assert.equal((await post("automation", { clientId: s.client, taskType: "selftest_draft", mode: "auto" })).code, 200);
  const money = await post("automation", { clientId: s.client, taskType: "ads_change", mode: "auto" });
  assert.equal(money.code, 409);
  assert.equal(money.body.code, "never_auto");
  assert.equal((await post("automation", { clientId: s.client, taskType: "x", mode: "yolo" })).code, 400);
  assert.equal((await post("client", { businessName: "", plan: "growth" })).code, 400);
  assert.equal((await post("client", { businessName: "X", plan: "platinum" })).code, 400);

  const created = await post("client", { businessName: "Acme", plan: "growth", email: "a@acme.co.za" });
  const cid = created.body.client.id;
  assert.equal((await post("price", { clientId: cid, cents: 249900 })).code, 200);
  const inv = await post("invite", { clientId: cid });
  assert.match(inv.body.link, /^https:\/\/test\.example\/onboarding\?token=/);
  const token = new URL(inv.body.link).searchParams.get("token");
  assert.equal((await s.q(`select token_hash from ap_onboarding_invites`))[0].token_hash, createHash("sha256").update(token).digest("hex"), "only the hash is stored");
  assert.ok(!JSON.stringify(await s.q(`select * from ap_onboarding_invites`)).includes(token));

  // the client opens the link
  const info = await call(s.api, { url: `/api/autopilot/onboarding?token=${token}` });
  assert.equal(info.body.businessName, "Acme");
  assert.equal((await call(s.api, { url: "/api/autopilot/onboarding?token=short" })).code, 404);
  const profile = { tone: "friendly", offers: "Free quote", banned_claims: ["guaranteed"] };
  const noConsent = await call(s.api, { method: "POST", url: "/api/autopilot/onboarding", body: { token, profile, aiConsent: true, dataConsent: false } });
  assert.equal(noConsent.code, 400);
  const done = await call(s.api, { method: "POST", url: "/api/autopilot/onboarding", body: { token, profile, aiConsent: true, dataConsent: true } });
  assert.equal(done.code, 200);
  assert.equal((await call(s.api, { method: "POST", url: "/api/autopilot/onboarding", body: { token, profile, aiConsent: true, dataConsent: true } })).code, 404, "one use only");
  assert.equal((await s.q(`select wording_version from ap_consents where client_id=$1 limit 1`, [cid]))[0].wording_version, "draft-0");
});

// ------------------------------------------------------------------ PayFast notifications
function itnBody(clientId, over = {}) {
  const pairs = Object.entries({ m_payment_id: clientId, pf_payment_id: "900001", payment_status: "COMPLETE", item_name: "KODA Presence", amount_gross: "1499.00", custom_str1: clientId, ...over });
  return new URLSearchParams([...pairs, ["signature", itnSignature(pairs, ENV.PAYFAST_PASSPHRASE)]]).toString();
}

test("payfast: a genuine payment activates billing once; forgeries and wrong amounts change nothing", async () => {
  const s = await setup();
  const c = await mkClient(s.db, { billing: "none", name: "Payer", plan: "presence" });
  const post = (body, ip = s.PF_IP) => call(s.api, { method: "POST", url: "/api/autopilot/payfast-itn", body, ip });

  const first = await post(itnBody(c));
  assert.equal(first.code, 200);
  assert.equal(first.body.result, "applied");
  assert.equal((await s.q(`select billing_status from ap_clients where id=$1`, [c]))[0].billing_status, "active");
  assert.equal((await post(itnBody(c))).body.result, "duplicate");

  const c2 = await mkClient(s.db, { billing: "none", name: "Forged" });
  assert.equal((await post(itnBody(c2).replace("1499.00", "1.00"))).code, 400, "tampered");
  assert.equal((await post(itnBody(c2), "6.6.6.6")).code, 503, "right signature, wrong sender");
  assert.equal((await post(itnBody(c2, { amount_gross: "1.00", pf_payment_id: "2" }))).code, 503, "right signature, wrong amount");
  assert.equal((await post("garbage=1")).code, 400);
  assert.equal((await s.q(`select billing_status from ap_clients where id=$1`, [c2]))[0].billing_status, "none");
  assert.ok((await s.q(`select 1 from ap_audit_log where action='billing.itn_rejected'`)).length >= 2);

  await s.db.exec(`update ap_clients set price_cents = 1200000 where id='${c2}'`);
  assert.equal((await post(itnBody(c2, { amount_gross: "12000.00", pf_payment_id: "3" }))).code, 200, "the agreed price is what counts");

  // failure and cancellation notices
  assert.equal((await post(itnBody(c, { payment_status: "FAILED", pf_payment_id: "4" }))).code, 200);
  assert.equal((await s.q(`select billing_status from ap_clients where id=$1`, [c]))[0].billing_status, "past_due");
  assert.equal((await post(itnBody(c, { payment_status: "CANCELLED", amount_gross: "0.00", pf_payment_id: "5" }))).code, 200);
  assert.equal((await s.q(`select billing_status from ap_clients where id=$1`, [c]))[0].billing_status, "cancelled");
  assert.equal((await post(itnBody(c, { payment_status: "PENDING", pf_payment_id: "6" }))).body.ignored, true);
});

test("unknown routes and wrong methods are refused", async () => {
  const s = await setup();
  assert.equal((await call(s.api, { url: "/api/autopilot/nothing" })).code, 404);
  assert.equal((await call(s.api, { url: "/api/autopilot/payfast-itn" })).code, 405);
  assert.equal((await call(s.api, { method: "DELETE", url: "/api/autopilot/tick" })).code, 404);
});
