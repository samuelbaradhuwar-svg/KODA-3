// Saving an audit request when it arrives (called by api/audit.js). Stores only what the visitor submitted, trimmed.
// Best effort: if the database is not set up or is down, the request email still goes out and nothing breaks.
import { createDb } from "./db.js";

export const retentionDays = () => {
  const n = Number(process.env.COMMAND_RETENTION_DAYS);
  return Number.isFinite(n) && n >= 7 && n <= 1095 ? Math.round(n) : 180;
};
const cut = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n).trim();
const num = (v) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Math.round(Number(v)) : null);
const list = (a, n) => (Array.isArray(a) ? a.slice(0, n) : []);

// The findings come back from the visitor's browser, so they are trimmed to known fields and treated as unverified.
export function trimFindings(sum) {
  if (!sum || typeof sum !== "object") return null;
  const sc = sum.scores && typeof sum.scores === "object" ? sum.scores : null;
  return {
    scores: sc ? { speed: num(sc.speed), accessibility: num(sc.accessibility), seo: num(sc.seo), practice: num(sc.practice) } : null,
    fixes: list(sum.fixes, 3).map((f) => ({ title: cut(f?.title, 120), body: cut(f?.body, 400) })),
    opportunities: list(sum.opportunities, 8).map((o) => ({ title: cut(o?.title, 120), service: cut(o?.service, 100) })),
    checks: list(sum.checks, 30).map((c) => ({ label: cut(c?.label, 80), status: ["pass", "warn", "fail", "info"].includes(c?.status) ? c.status : "info", detail: cut(c?.detail, 200) })),
  };
}

export async function saveRequest({ url, email, business, phone, note, summary }, { db, now = new Date() } = {}) {
  try {
    db ??= createDb();
    const row = await db.insert("cc_requests", {
      site_url: cut(url, 300),
      email: cut(email, 200),
      business: cut(business, 120) || null,
      phone: cut(phone, 40) || null,
      note: cut(note, 600) || null,
      auto_findings: trimFindings(summary),
      delete_after: new Date(now.getTime() + retentionDays() * 86_400_000).toISOString(),
    });
    return row?.id || null;
  } catch {
    return null;
  }
}
