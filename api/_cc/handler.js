// Command centre API. Every route needs the admin's sign-in token, checked here on the server, except the private
// client report (added in a later step), which is checked by its own unguessable link.
import { createDb, isUuid } from "./db.js";
import { verifyAdmin, adminEmail } from "./auth.js";
import { retentionDays } from "./requests.js";

export const STATUSES = ["new", "replied", "audit_drafted", "sent", "won", "lost"];

const fails = new Map();
function tooManyFails(ip) {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < 600_000);
  fails.set(ip, list);
  if (fails.size > 2000) fails.clear();
  return list.length >= 20;
}
const noteFail = (ip) => fails.set(ip, [...(fails.get(ip) || []), Date.now()]);

function routeOf(req) {
  const path = String(req.url || "").split("?")[0];
  const i = path.indexOf("/api/command");
  return path.slice(i + "/api/command".length).split("/").filter(Boolean).map((s) => decodeURIComponent(s));
}

const cut = (v, n) => String(v ?? "").slice(0, n);

export function createHandler({ db, verify = verifyAdmin, now = () => new Date() } = {}) {
  let store = db;
  const getDb = () => (store ??= createDb());

  return async function handler(req, res) {
    res.setHeader("cache-control", "no-store");
    res.setHeader("x-robots-tag", "noindex, nofollow");
    const send = (code, body) => res.status(code).json(body);

    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
    if (tooManyFails(ip)) return send(429, { ok: false, error: "Too many attempts. Try again in a few minutes." });

    const auth = String(req.headers.authorization || "");
    const user = await verify(auth.startsWith("Bearer ") ? auth.slice(7) : "");
    if (!user) {
      noteFail(ip);
      return send(401, { ok: false, error: "Not signed in." });
    }

    let d;
    try {
      d = getDb();
    } catch {
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
      return send(404, { ok: false, error: "Not found." });
    } catch {
      return send(502, { ok: false, error: "Something went wrong talking to the database. Try again." });
    }
  };
}
