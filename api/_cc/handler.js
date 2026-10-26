// Command centre API. Every route needs the admin's sign-in token, checked here on the server, except the private
// client report (added in a later step), which is checked by its own unguessable link.
import { createDb, isUuid } from "./db.js";
import { verifyAdmin, adminEmail } from "./auth.js";
import { retentionDays } from "./requests.js";
import { crawlSite } from "./crawl.js";
import { pageSpeed } from "./psi.js";
import { technicalFindings, checkedSummary } from "./technical.js";
import { SERVICE_KEYS, resolveService } from "./catalog.js";
import { searchFindings, searchNotes } from "./search.js";
import { conversionFindings } from "./conversion.js";
import { MANUAL_CHECKLIST } from "./manual.js";
import { sanitizeFindings, sanitizeManual } from "./audit-edit.js";
import { buildReport } from "./report.js";
import { randomBytes } from "node:crypto";

export const STATUSES = ["new", "replied", "audit_drafted", "sent", "won", "lost"];

const fails = new Map();
function tooManyFails(ip) {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < 600_000);
  fails.set(ip, list);
  if (fails.size > 2000) fails.clear();
  return list.length >= 20;
}
// The client report link is public but unguessable (256 bits). Reads are still limited per visitor.
const views = new Map();
function viewLimited(ip) {
  const now = Date.now();
  const list = (views.get(ip) || []).filter((t) => now - t < 3_600_000);
  list.push(now);
  views.set(ip, list);
  if (views.size > 2000) views.clear();
  return list.length > 120;
}
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const noteFail = (ip) => fails.set(ip, [...(fails.get(ip) || []), Date.now()]);

function routeOf(req) {
  const path = String(req.url || "").split("?")[0];
  const i = path.indexOf("/api/command");
  return path.slice(i + "/api/command".length).split("/").filter(Boolean).map((s) => decodeURIComponent(s));
}

const cut = (v, n) => String(v ?? "").slice(0, n);

// The crawler opens other people's websites, so it is limited: a few runs an hour, and never two at once for one audit.
const runs = [];
function crawlLimited(now) {
  const t = now().getTime();
  while (runs.length && t - runs[0] > 3_600_000) runs.shift();
  if (runs.length >= 8) return true;
  runs.push(t);
  return false;
}

// Re-running the analysis replaces the automatic findings, but never touches ones you edited or added yourself.
export function mergeFindings(existing = [], fresh = []) {
  const keep = existing.filter((f) => f.edited || f.source !== "auto");
  const taken = new Set(keep.map((f) => f.id));
  return [...keep, ...fresh.filter((f) => !taken.has(f.id))];
}

export function createHandler({ db, verify = verifyAdmin, now = () => new Date(), crawl = crawlSite, speed = pageSpeed } = {}) {
  let store = db;
  const getDb = () => (store ??= createDb());

  return async function handler(req, res) {
    res.setHeader("cache-control", "no-store");
    res.setHeader("x-robots-tag", "noindex, nofollow");
    const send = (code, body) => res.status(code).json(body);

    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
    if (tooManyFails(ip)) return send(429, { ok: false, error: "Too many attempts. Try again in a few minutes." });

    // The one public route: a client opening their report by its private link. Nothing but the report is returned.
    const route0 = routeOf(req);
    if (route0[0] === "report" && route0.length === 2 && req.method === "GET") {
      if (viewLimited(ip)) return send(429, { ok: false, error: "Too many requests. Please try again later." });
      if (!TOKEN.test(route0[1])) return send(404, { ok: false, error: "This report link is not valid." });
      let dd;
      try {
        dd = getDb();
        const [au] = await dd.select("cc_audits", `select=*&report_token=eq.${route0[1]}&limit=1`);
        if (!au || !au.token_expires_at || new Date(au.token_expires_at) <= now()) return send(404, { ok: false, error: "This report link has expired or was withdrawn. Please ask us for a new one." });
        const [rq] = await dd.select("cc_requests", `select=business,site_url&id=eq.${au.request_id}`);
        if (!rq) return send(404, { ok: false, error: "This report link has expired or was withdrawn. Please ask us for a new one." });
        return send(200, { ok: true, report: buildReport({ request: { business: rq.business, site_url: rq.site_url }, audit: au, now: now() }), expires: au.token_expires_at });
      } catch {
        return send(502, { ok: false, error: "We could not load the report. Please try again." });
      }
    }

    const auth = String(req.headers.authorization || "");
    const user = await verify(auth.startsWith("Bearer ") ? auth.slice(7) : "");
    if (!user) {
      noteFail(ip);
      return send(401, { ok: false, error: "Not signed in." });
    }

    let d;
    try {
      d = getDb();
    } catch (e) {
      if (e?.code === "public_key") return send(503, { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY in Vercel holds the public (anon or publishable) key. Replace it with the service_role or secret key, then redeploy." });
      return send(503, { ok: false, error: "The database is not set up yet. See COMMAND-CENTER.md." });
    }

    const [a, id, b] = routeOf(req);
    const method = req.method;
    try {
      if (a === "me" && method === "GET") {
        return send(200, { ok: true, email: user.email, adminEmail: adminEmail(), retentionDays: retentionDays() });
      }

      if (a === "requests" && !id && method === "GET") {
        // Requests past their retention date are removed whenever the inbox is opened.
        await d.purgeExpired("cc_requests", "delete_after", now().toISOString());
        const rows = await d.select("cc_requests", "select=id,created_at,site_url,email,business,phone,status,delete_after&order=created_at.desc&limit=300");
        return send(200, { ok: true, requests: rows });
      }

      if (a === "requests" && isUuid(id) && !b) {
        if (method === "GET") {
          const [row] = await d.select("cc_requests", `select=*&id=eq.${id}`);
          if (!row) return send(404, { ok: false, error: "Not found." });
          const audits = await d.select("cc_audits", `select=id,state,created_at,updated_at&request_id=eq.${id}&order=created_at.desc`);
          const sends = await d.select("cc_sends", `select=id,sent_at,to_email,subject,ok&request_id=eq.${id}&order=sent_at.desc`);
          return send(200, { ok: true, request: row, audits, sends });
        }
        if (method === "PATCH") {
          const body = typeof req.body === "object" && req.body ? req.body : {};
          const patch = {};
          if (body.status !== undefined) {
            if (!STATUSES.includes(body.status)) return send(400, { ok: false, error: "Unknown status." });
            patch.status = body.status;
          }
          if (body.admin_notes !== undefined) patch.admin_notes = cut(body.admin_notes, 5000);
          if (!Object.keys(patch).length) return send(400, { ok: false, error: "Nothing to change." });
          const row = await d.updateById("cc_requests", id, patch);
          if (!row) return send(404, { ok: false, error: "Not found." });
          return send(200, { ok: true, request: row });
        }
        if (method === "DELETE") {
          // Audits and the send log go with it (cascade). This is the POPIA delete.
          await d.deleteById("cc_requests", id);
          return send(200, { ok: true });
        }
      }

      if (a === "catalog" && method === "GET") {
        return send(200, { ok: true, services: Object.fromEntries(SERVICE_KEYS.map((k) => [k, resolveService(k)])), checklist: MANUAL_CHECKLIST });
      }

      if (a === "requests" && isUuid(id) && b === "audits" && method === "POST") {
        const [req0] = await d.select("cc_requests", `select=id,status&id=eq.${id}`);
        if (!req0) return send(404, { ok: false, error: "Not found." });
        const [existing] = await d.select("cc_audits", `select=*&request_id=eq.${id}&state=neq.sent&order=created_at.desc&limit=1`);
        const audit = existing || (await d.insert("cc_audits", { request_id: id }));
        return send(200, { ok: true, audit });
      }

      if (a === "audits" && isUuid(id)) {
        const [audit] = await d.select("cc_audits", `select=*&id=eq.${id}`);
        if (!audit) return send(404, { ok: false, error: "Not found." });
        const body = typeof req.body === "object" && req.body ? req.body : {};
        const touch = { updated_at: now().toISOString() };

        const notesFor = (a) => [...checkedSummary(a.crawl, a.pagespeed || {}), ...(a.crawl ? searchNotes(a.manual?.inputs) : [])];

        if (!b && method === "GET") return send(200, { ok: true, audit, notes: notesFor(audit) });

        if (!b && method === "PATCH") {
          const patch = {};
          if (body.findings !== undefined) {
            const f = sanitizeFindings(body.findings, audit.findings || []);
            if (!f) return send(400, { ok: false, error: "Findings must be a list." });
            patch.findings = f;
          }
          if (body.manual !== undefined) {
            const m = sanitizeManual(body.manual, audit.manual || {});
            if (!m) return send(400, { ok: false, error: "Business details were not understood." });
            patch.manual = m;
          }
          if (body.summary !== undefined) patch.summary = cut(body.summary, 4000);
          if (body.plan !== undefined) patch.plan = cut(body.plan, 6000);
          if (!Object.keys(patch).length) return send(400, { ok: false, error: "Nothing to change." });
          const row = await d.updateById("cc_audits", id, { ...patch, ...touch });
          return send(200, { ok: true, audit: row, notes: notesFor(row) });
        }

        if (b === "report" && method === "GET") {
          const [r] = await d.select("cc_requests", `select=business,site_url&id=eq.${audit.request_id}`);
          return send(200, { ok: true, report: buildReport({ request: r, audit, now: now(), admin: true }), link: audit.report_token ? { token: audit.report_token, expires: audit.token_expires_at, active: new Date(audit.token_expires_at) > now() } : null });
        }

        if (b === "link" && method === "POST") {
          if (body.action === "revoke") {
            const row = await d.updateById("cc_audits", id, { report_token: null, token_expires_at: null, ...touch });
            return send(200, { ok: true, link: null, audit: row });
          }
          const days = Math.min(180, Math.max(1, Math.round(Number(body.days) || 30)));
          const token = randomBytes(32).toString("base64url");
          const expires = new Date(now().getTime() + days * 86_400_000).toISOString();
          await d.updateById("cc_audits", id, { report_token: token, token_expires_at: expires, ...touch });
          return send(200, { ok: true, link: { token, expires, active: true } });
        }

        if (b === "crawl" && method === "POST") {
          if (audit.state === "running" && now() - new Date(audit.updated_at) < 120_000) return send(409, { ok: false, error: "A crawl is already running for this audit." });
          if (crawlLimited(now)) return send(429, { ok: false, error: "Crawl limit reached for now (8 an hour). Try again later." });
          const [r] = await d.select("cc_requests", `select=id,site_url,status&id=eq.${audit.request_id}`);
          await d.updateById("cc_audits", id, { state: "running", ...touch });
          let result;
          try {
            result = await crawl(r.site_url);
          } catch {
            await d.updateById("cc_audits", id, { state: "draft", ...touch });
            return send(502, { ok: false, error: "The crawl failed. Try again." });
          }
          const row = await d.updateById("cc_audits", id, { crawl: result, state: "draft", ...touch });
          if (r.status === "new" || r.status === "replied") await d.updateById("cc_requests", r.id, { status: "audit_drafted" });
          return send(200, { ok: true, audit: row });
        }

        if (b === "speed" && method === "POST") {
          const strategy = body.strategy === "desktop" ? "desktop" : "mobile";
          const [r] = await d.select("cc_requests", `select=site_url&id=eq.${audit.request_id}`);
          const url = audit.crawl?.finalUrl || r.site_url;
          const result = await speed(url, strategy);
          const row = await d.updateById("cc_audits", id, { pagespeed: { ...(audit.pagespeed || {}), [strategy]: result }, ...touch });
          return send(200, { ok: true, audit: row });
        }

        if (b === "analyse" && method === "POST") {
          if (!audit.crawl) return send(400, { ok: false, error: "Run the crawl first." });
          const fresh = [...technicalFindings(audit.crawl, audit.pagespeed || {}), ...searchFindings(audit.crawl, audit.manual?.inputs || {}), ...conversionFindings(audit.crawl)];
          const row = await d.updateById("cc_audits", id, { findings: mergeFindings(audit.findings, fresh), state: "ready", ...touch });
          return send(200, { ok: true, audit: row, notes: notesFor(row) });
        }
      }
      return send(404, { ok: false, error: "Not found." });
    } catch (e) {
      console.error("command api:", String(e?.message || e).slice(0, 200)); // path and status only, never a key or a row
      const status = String(e?.message || "").match(/\((\d{3})\)/)?.[1];
      return send(502, { ok: false, error: status === "401" || status === "403" ? "The database refused the request (the server key in Vercel is probably the wrong one or the wrong style). See COMMAND-CENTER.md." : "Something went wrong talking to the database. Try again." });
    }
  };
}
