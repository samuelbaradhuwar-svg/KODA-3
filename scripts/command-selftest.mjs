// Checks the command centre without any outside service: sign-in rules, the requests API against an in-memory
// database, request saving and trimming, the safe-fetch address rules, and the database migration (in PGlite).
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHandler } from "../api/_cc/handler.js";
import { saveRequest, trimFindings, retentionDays } from "../api/_cc/requests.js";
import { isPrivateIp, assertPublic } from "../api/_safe.js";
import { verifyAdmin } from "../api/_cc/auth.js";

// ---- in-memory stand-in for api/_cc/db.js
function memDb() {
  const t = { cc_requests: [], cc_audits: [], cc_sends: [] };
  let n = 0;
  const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
  return {
    t,
    insert: async (table, row) => { const r = { id: uuid(), created_at: new Date().toISOString(), status: "new", ...row }; t[table].push(r); return r; },
    select: async (table, q) => {
      const m = q.match(/(?:request_)?id=eq\.([0-9a-f-]+)/);
      return t[table].filter((r) => !m || r.id === m[1] || r.request_id === m[1]);
    },
    updateById: async (table, id, patch) => { const r = t[table].find((x) => x.id === id); return r ? Object.assign(r, patch) : null; },
    deleteById: async (table, id) => { t.cc_requests = t.cc_requests.filter((x) => x.id !== id); },
    purgeExpired: async (table, col, nowIso) => { const before = t[table].length; t[table] = t[table].filter((r) => r[col] >= nowIso); return before - t[table].length; },
  };
}
const ADMIN = { email: "hello@heykoda.co.za" };
const verify = async (tok) => (tok === "good" ? ADMIN : null);

const call = (handler, { method = "GET", url, body, token = "good", ip = "9.9.9.9" }) =>
  new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(o) { resolve({ code: this.code, body: o, headers: this.headers }); } };
    handler({ method, url, body, headers: { authorization: token ? `Bearer ${token}` : "", "x-forwarded-for": ip }, socket: {} }, res);
  });

// ---- saving a request trims and caps what the visitor sent
const db = memDb();
const fixed = new Date("2026-10-25T10:00:00Z");
const id = await saveRequest(
  { url: "https://example.co.za/", email: "a@b.co", business: "x".repeat(500), phone: "0", note: "hi", summary: { scores: { speed: "88.4" }, fixes: [{ title: "<b>T</b>", body: "y".repeat(900) }], checks: [{ label: "L", status: "evil", detail: "d" }], junk: "no" } },
  { db, now: fixed }
);
assert.ok(id);
const saved = db.t.cc_requests[0];
assert.equal(saved.business.length, 120);
assert.equal(saved.auto_findings.scores.speed, 88);
assert.equal(saved.auto_findings.fixes[0].body.length, 400);
assert.equal(saved.auto_findings.checks[0].status, "info");
assert.ok(!("junk" in saved.auto_findings));
assert.equal(new Date(saved.delete_after).getTime() - fixed.getTime(), retentionDays() * 86_400_000);
assert.equal(await saveRequest({ url: "u", email: "e" }, { db: { insert: async () => { throw new Error("down"); } } }), null, "a database failure never throws");
assert.equal(trimFindings(null), null);

// ---- API: sign-in is required, and only the admin gets in
const h = createHandler({ db, verify, now: () => fixed });
let r = await call(h, { url: "/api/command/requests", token: "" });
assert.equal(r.code, 401);
r = await call(h, { url: "/api/command/requests", token: "someone-else" });
assert.equal(r.code, 401);
assert.equal(r.headers["x-robots-tag"], "noindex, nofollow");
assert.equal(r.headers["cache-control"], "no-store");
r = await call(h, { url: "/api/command/me" });
assert.equal(r.body.email, "hello@heykoda.co.za");

// ---- API: inbox, detail, status, notes, delete
r = await call(h, { url: "/api/command/requests" });
assert.equal(r.body.requests.length, 1);
r = await call(h, { url: `/api/command/requests/${id}` });
assert.equal(r.body.request.site_url, "https://example.co.za/");
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: { status: "replied", admin_notes: "n" } });
assert.equal(r.body.request.status, "replied");
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: { status: "bogus" } });
assert.equal(r.code, 400);
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: {} });
assert.equal(r.code, 400);
r = await call(h, { url: "/api/command/requests/not-a-uuid" });
assert.equal(r.code, 404);
r = await call(h, { method: "DELETE", url: `/api/command/requests/${id}` });
assert.equal(r.body.ok, true);
assert.equal(db.t.cc_requests.length, 0);

// ---- retention: expired requests go when the inbox opens
await saveRequest({ url: "https://old.co.za/", email: "o@o.co" }, { db, now: new Date("2020-01-01") });
await saveRequest({ url: "https://new.co.za/", email: "n@n.co" }, { db, now: fixed });
r = await call(h, { url: "/api/command/requests" });
assert.equal(r.body.requests.length, 1);
assert.equal(r.body.requests[0].site_url, "https://new.co.za/");

// ---- repeated bad sign-ins are slowed down
for (let i = 0; i < 20; i++) await call(h, { url: "/api/command/me", token: "bad", ip: "7.7.7.7" });
r = await call(h, { url: "/api/command/me", token: "bad", ip: "7.7.7.7" });
assert.equal(r.code, 429);

// ---- not configured: a clear message, not a crash
const h2 = createHandler({ verify });
const keep = { u: process.env.SUPABASE_URL, k: process.env.SUPABASE_SERVICE_ROLE_KEY };
delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
r = await call(h2, { url: "/api/command/requests" });
assert.equal(r.code, 503);
Object.assign(process.env, Object.fromEntries(Object.entries({ SUPABASE_URL: keep.u, SUPABASE_SERVICE_ROLE_KEY: keep.k }).filter(([, v]) => v)));

// ---- admin check against a fake Supabase: wrong person, unconfirmed email and bad tokens are all refused
const realFetch = globalThis.fetch;
const user = (o) => async () => ({ ok: true, json: async () => o });
const cfg = { url: "https://x.supabase.co", key: "k" };
globalThis.fetch = user({ email: "Hello@HeyKoda.co.za", email_confirmed_at: "2026-01-01" });
assert.deepEqual(await verifyAdmin("t", cfg), { email: "hello@heykoda.co.za" });
globalThis.fetch = user({ email: "evil@example.com", email_confirmed_at: "2026-01-01" });
assert.equal(await verifyAdmin("t", cfg), null);
globalThis.fetch = user({ email: "hello@heykoda.co.za" });
assert.equal(await verifyAdmin("t", cfg), null);
globalThis.fetch = async () => ({ ok: false });
assert.equal(await verifyAdmin("t", cfg), null);
assert.equal(await verifyAdmin("", cfg), null);
globalThis.fetch = realFetch;

// ---- only public addresses
for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.1", "172.16.5.5", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:a9fe:a9fe", "::ffff:172.20.0.1"]) assert.ok(isPrivateIp(ip), `${ip} must be private`);
for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) assert.ok(!isPrivateIp(ip), `${ip} must be public`);
for (const u of ["http://localhost/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data", "ftp://example.com/", "http://user:pw@example.com/", "http://box.internal/"]) {
  await assert.rejects(assertPublic(u), undefined, `${u} must be refused`);
}

// ---- the database migration applies and rolls back, and nothing is readable by the browser roles
const { PGlite } = await import("@electric-sql/pglite");
const pg = new PGlite();
await pg.exec("create role anon; create role authenticated;");
await pg.exec(fs.readFileSync("command-center/db/0001_cc_init.sql", "utf8"));
const rls = await pg.query("select relname, relrowsecurity from pg_class where relname like 'cc\\_%' and relkind='r' order by 1");
assert.equal(rls.rows.length, 3);
assert.ok(rls.rows.every((x) => x.relrowsecurity), "row level security on every table");
const pol = await pg.query("select count(*)::int as n from pg_policies where tablename like 'cc\\_%'");
assert.equal(pol.rows[0].n, 0, "no policies, so the browser can read nothing");
await pg.exec("insert into cc_requests(site_url,email) values ('https://a.co.za','a@b.co')");
await assert.rejects(pg.exec("insert into cc_requests(site_url,email,status) values ('https://a.co.za','a@b.co','weird')"));
await pg.exec("insert into cc_audits(request_id) select id from cc_requests");
await pg.exec("delete from cc_requests");
assert.equal((await pg.query("select count(*)::int as n from cc_audits")).rows[0].n, 0, "deleting a request deletes its audit");
await pg.exec(fs.readFileSync("command-center/db/0001_cc_init.down.sql", "utf8"));

console.log("command centre self-test: all checks passed");
