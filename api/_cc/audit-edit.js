// What the owner edits in an audit (findings, business details, manual review). Everything that comes back from the
// browser is checked and trimmed here, because the page is a convenience and the server is the guard.
import { SEVERITIES, BUCKETS } from "./technical.js";
import { SERVICE_KEYS } from "./catalog.js";
import { MANUAL_KEYS, MANUAL_STATUSES } from "./manual.js";

const cut = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n).trim();
const AREAS = ["technical", "search", "conversion", "manual"];
const FIELDS = ["title", "evidence", "why", "fix", "severity", "bucket", "service_key", "include"];

export function sanitizeFindings(input, stored = []) {
  if (!Array.isArray(input)) return null;
  const byId = new Map(stored.map((f) => [f.id, f]));
  const seen = new Set();
  const out = [];
  for (const f of input.slice(0, 120)) {
    const id = cut(f?.id, 60).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const old = byId.get(id);
    const clean = {
      id,
      area: AREAS.includes(f.area) ? f.area : "manual",
      severity: SEVERITIES.includes(f.severity) ? f.severity : "medium",
      title: cut(f.title, 140),
      evidence: cut(f.evidence, 900),
      why: cut(f.why, 600),
      fix: cut(f.fix, 700),
      service_key: SERVICE_KEYS.includes(f.service_key) ? f.service_key : null,
      bucket: BUCKETS.includes(f.bucket) ? f.bucket : "next",
      include: f.include !== false,
      // a finding the server did not generate is always the owner's own
      source: old ? old.source : "manual",
    };
    if (!clean.title) continue;
    clean.edited = Boolean(old?.edited) || (old ? FIELDS.some((k) => (old[k] ?? null) !== (clean[k] ?? null)) : false);
    out.push(clean);
  }
  return out;
}

export function sanitizeManual(input, stored = {}) {
  if (!input || typeof input !== "object") return null;
  const out = { inputs: { ...(stored.inputs || {}) }, checklist: { ...(stored.checklist || {}) } };
  if (input.inputs && typeof input.inputs === "object") {
    const caps = { businessName: 120, trade: 160, town: 160, areas: 300, address: 200, phone: 40 };
    for (const [k, n] of Object.entries(caps)) if (input.inputs[k] !== undefined) out.inputs[k] = cut(input.inputs[k], n);
  }
  if (input.report && typeof input.report === "object") {
    const onceOk = ["auto", "none", "Starter", "Business", "Custom"];
    const monthlyOk = ["auto", "none", "Presence", "Growth", "Performance"];
    const r = input.report;
    out.report = { ...(stored.report || {}) };
    if (r.winIds !== undefined) out.report.winIds = (Array.isArray(r.winIds) ? r.winIds : []).map((x) => cut(x, 60).replace(/[^a-zA-Z0-9_-]/g, "")).filter(Boolean).slice(0, 3);
    if (r.once !== undefined) out.report.once = onceOk.includes(r.once) ? r.once : "auto";
    if (r.monthly !== undefined) out.report.monthly = monthlyOk.includes(r.monthly) ? r.monthly : "auto";
  }
  if (stored.report && !out.report) out.report = stored.report;
  if (input.checklist && typeof input.checklist === "object") {
    for (const key of MANUAL_KEYS) {
      const c = input.checklist[key];
      if (!c) continue;
      out.checklist[key] = { status: MANUAL_STATUSES.includes(c.status) ? c.status : "todo", notes: cut(c.notes, 2000) };
    }
  }
  return out;
}
