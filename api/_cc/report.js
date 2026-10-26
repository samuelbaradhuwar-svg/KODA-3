// The client report. Built from the audit's included findings, the manual review and the website's own price list.
// Nothing here invents a number: counts come from the findings, scores from Google, prices and timelines from
// src/catalog.js. The wording of the summary and plan is a default the owner can edit before anything is shared.
import { PLANS, MONTHLY_PLANS } from "../../src/catalog.js";
import { resolveService } from "./catalog.js";
import { MANUAL_CHECKLIST } from "./manual.js";

export const DISCLAIMER = [
  "Results are not guaranteed. We cannot promise a ranking on Google, a number of visitors or a number of enquiries; search engines and customers decide those.",
  "What we can do is fix the things in this report, which are common reasons a site is harder to find, harder to trust and harder to contact.",
  "This is a snapshot of the site on the date above. Our audit reads up to 10 pages and can miss things. Your Google Business Profile, the design and the writing are assessed in a hands-on review, and anything still marked \"not yet reviewed\" has not been assessed yet.",
];

// Findings made from the manual checklist before they carried an explanation are completed from the checklist wording.
function repairManual(f) {
  if (!String(f.id).startsWith("manual-")) return f;
  const item = MANUAL_CHECKLIST.find((m) => `manual-${m.key}` === f.id);
  if (!item?.finding) return f;
  const ev = String(f.evidence || "");
  return {
    ...f,
    title: f.title === item.title ? item.finding.title : f.title,
    why: f.why || item.finding.why,
    fix: f.fix || item.finding.fix,
    service_key: f.service_key || item.finding.service,
    evidence: /^Checked by hand\.?$/.test(ev) ? "From our hands-on review." : ev.replace(/^Checked by hand: /, "From our hands-on review: "),
  };
}

const SEV = { high: 0, medium: 1, low: 2, info: 3 };
const BUCKET = { fix_first: 0, next: 1, later: 2 };
const BUCKET_LABEL = { fix_first: "Fix first", next: "Next", later: "Later" };
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return String(u || "");
  }
};
const KEEP_CAPS = /^(Google|KODA|HTTPS|HSTS|WhatsApp|SSL|SEO)\b/;
const lcFirst = (t) => (KEEP_CAPS.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
const join = (a) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const sort = (a) => [...a].sort((x, y) => (BUCKET[x.bucket] - BUCKET[y.bucket]) || (SEV[x.severity] - SEV[y.severity]));

function planCard(name, kind) {
  const p = (kind === "once-off" ? PLANS : MONTHLY_PLANS).find((x) => x.name === name);
  return p ? { kind, name: p.name, price: p.price, note: p.note, timeline: kind === "once-off" ? p.timeline : "Ongoing, month to month", desc: p.desc, features: p.features } : null;
}

// What we would suggest, from the included findings. The owner can override it.
export function suggestPlan(findings) {
  const n = (...keys) => findings.filter((f) => keys.includes(f.service_key)).length;
  const build = n("redesign", "design");
  const buildHigh = findings.filter((f) => ["redesign", "design"].includes(f.service_key) && f.severity === "high").length;
  const seo = n("seo", "seo_social");
  let once = null;
  let onceWhy = "";
  if (n("booking", "ecommerce")) { once = "Custom"; onceWhy = "the site needs online booking or selling, which is what our Custom plan is for"; }
  else if (build >= 2 || buildHigh >= 1) { once = "Business"; onceWhy = "several of the findings are about how the site is built and laid out, and a rebuild is the cleanest way to fix them together"; }
  let monthly = null;
  let monthlyWhy = "";
  if (seo >= 4) { monthly = "Growth"; monthlyWhy = "there is a lot of ongoing search work to do"; }
  else if (n("seo", "seo_social", "maintenance", "gbp") >= 1) { monthly = "Presence"; monthlyWhy = "the site and its Google presence will need regular attention once the first fixes are done"; }
  return { once, monthly, onceWhy, monthlyWhy };
}

function strengths(crawl, speed) {
  const out = [];
  if (!crawl || crawl.site?.homeError) return out;
  const home = crawl.pages?.[0];
  const pages = (crawl.pages || []).filter((p) => p.status >= 200 && p.status < 300);
  if (crawl.finalUrl?.startsWith("https://")) out.push("The site loads securely (HTTPS).");
  if (crawl.site?.sitemap?.found) out.push("A sitemap is in place for search engines.");
  if (home?.viewport) out.push("The site is set up to display properly on phones.");
  if (home?.schema?.length && !home.schema.includes("(invalid JSON-LD)")) out.push("Your business details are marked up for search engines.");
  if (speed?.mobile?.scores?.speed >= 90) out.push(`It is fast on a phone: Google scores it ${speed.mobile.scores.speed} out of 100.`);
  if (pages.some((p) => p.tel?.length)) out.push("The phone number can be tapped to call.");
  if (pages.some((p) => p.whatsapp)) out.push("Customers can contact you on WhatsApp.");
  if (pages.some((p) => p.signals?.testimonials)) out.push("Reviews or testimonials are shown on the site.");
  const l = crawl.site?.links;
  if (l && l.checked >= 5 && !l.broken?.some((b) => !b.unverified)) out.push(`No broken links were found among the ${l.checked} checked.`);
  return out.slice(0, 6);
}

// What was not checked, in words for the client. The owner-facing notes (which mention settings) never go in here.
function clientNotes(audit) {
  const out = [];
  const crawl = audit.crawl;
  const speed = audit.pagespeed || {};
  if (!crawl) return ["The website audit has not been run yet."];
  for (const n of crawl.incomplete || []) out.push(String(n).slice(0, 160));
  for (const d of ["mobile", "desktop"]) {
    const label = d === "mobile" ? "a phone" : "a computer";
    if (speed[d]?.error) out.push(`Google's speed check on ${label} could not be completed.`);
    else if (!speed[d]) out.push(`Google's speed check on ${label} was not run.`);
  }
  const inp = audit.manual?.inputs || {};
  if (!inp.trade || !inp.town) out.push("We did not check whether your trade and town appear where Google looks, because we did not have those details.");
  if (!inp.phone && !inp.address && !inp.areas) out.push("We did not check whether your phone number, address and the areas you serve match across your site, because we did not have those details.");
  return out;
}

function manualSummary(audit) {
  const cl = audit.manual?.checklist || {};
  return MANUAL_CHECKLIST.map((m) => {
    const c = cl[m.key] || { status: "todo", notes: "" };
    return { group: m.group, title: m.title, status: c.status, notes: c.status === "na" ? "" : c.notes || "" };
  });
}

function defaultSummary({ name, hostname, facts, counts, strong, top, manual }) {
  const parts = [];
  parts.push(`We looked at ${hostname}${name ? ` for ${name}` : ""}. Our audit covered ${facts.pagesRead} ${facts.pagesRead === 1 ? "page" : "pages"}${facts.linksChecked ? ` and ${facts.linksChecked} links` : ""}${facts.googleMobile ? ", and we measured how it performs on phones" + (facts.googleDesktop ? " and computers" : "") : ""}.`);
  const total = counts.fix_first + counts.next + counts.later;
  if (!total) parts.push("We did not find any problems in what we checked.");
  else parts.push(`We found ${counts.fix_first} ${counts.fix_first === 1 ? "thing" : "things"} to fix first, ${counts.next} to do next and ${counts.later} that can wait.`);
  if (strong.length) parts.push(`Some things are already working well: ${join(strong.slice(0, 3).map((s) => lcFirst(s.replace(/\.$/, ""))))}.`);
  if (top) parts.push(`The most important thing to sort out first: ${lcFirst(top.title.replace(/\.$/, ""))}.`);
  const unreviewed = manual.filter((m) => m.status === "todo").length;
  parts.push(unreviewed === manual.length ? "Your Google Business Profile, the design and the writing are assessed in a hands-on review, which has not been done yet, so they are not covered here." : unreviewed ? "Your Google Business Profile, the design and the writing are assessed in a hands-on review. We have assessed some of those and the rest are marked as not yet reviewed." : "Your Google Business Profile, the design and the writing are assessed in a hands-on review, and our notes are included below.");
  return parts.join(" ");
}

function defaultPlanText({ rec, sug, byService }) {
  const lines = [];
  if (!rec.once && !rec.monthly) lines.push("Nothing in this audit needs a plan right now. Get in touch if you would like us to look at anything in more detail.");
  else {
    const names = [rec.once && `${rec.once.name} (${rec.once.price} ${rec.once.note})`, rec.monthly && `${rec.monthly.name} (${rec.monthly.price} ${rec.monthly.note})`].filter(Boolean);
    lines.push(`Our recommendation: ${names.join(", with ")}.`);
    if (rec.once && sug.onceWhy && rec.once.name === sug.once) lines.push(`We suggest ${rec.once.name} because ${sug.onceWhy}.`);
    if (rec.monthly && sug.monthlyWhy && rec.monthly.name === sug.monthly) lines.push(`${rec.once ? "Afterwards, we" : "We"} suggest ${rec.monthly.name} because ${sug.monthlyWhy}.`);
  }
  for (const s of byService) lines.push(`${s.service}: ${s.titles.length} ${s.titles.length === 1 ? "finding" : "findings"} (${join(s.titles.slice(0, 3).map(lcFirst))}).`);
  return lines.join("\n");
}

// The full report. `admin` adds the defaults and suggestions the editor needs; the public copy never has them.
export function buildReport({ request, audit, now = new Date(), admin = false }) {
  const all = (audit.findings || []).filter((f) => f.include !== false).map(repairManual);
  const findings = sort(all);
  const crawl = audit.crawl;
  const speed = audit.pagespeed || {};
  const choice = audit.manual?.report || {};
  const name = request.business || "";

  const counts = { fix_first: 0, next: 0, later: 0 };
  for (const f of findings) counts[f.bucket] = (counts[f.bucket] || 0) + 1;

  const winIds = (choice.winIds || []).filter((id) => findings.some((f) => f.id === id)).slice(0, 3);
  const auto = findings.filter((f) => f.severity !== "info" && f.why && f.fix).slice(0, 3);
  const wins = (winIds.length ? winIds.map((id) => findings.find((f) => f.id === id)) : auto).map((f) => ({ id: f.id, title: f.title, why: f.why, fix: f.fix, severity: f.severity }));

  const sug = suggestPlan(findings);
  const pick = (sel, suggested, kind) => (sel === "none" ? null : planCard(sel && sel !== "auto" ? sel : suggested, kind));
  const rec = { once: pick(choice.once, sug.once, "once-off"), monthly: pick(choice.monthly, sug.monthly, "monthly") };

  const svcCount = new Map();
  for (const f of findings) if (f.service_key) (svcCount.get(f.service_key) || svcCount.set(f.service_key, []).get(f.service_key)).push(f.title);
  const byService = [...svcCount.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, titles]) => ({ key: k, service: resolveService(k)?.service || k, titles }));

  const facts = {
    pagesRead: (crawl?.pages || []).filter((p) => p.status).length,
    linksChecked: crawl?.site?.links?.checked || 0,
    googleMobile: speed.mobile?.scores || null,
    googleDesktop: speed.desktop?.scores || null,
  };
  const strong = strengths(crawl, speed);
  const manual = manualSummary(audit);
  const summaryDefault = defaultSummary({ name, hostname: host(request.site_url), facts, counts, strong, top: wins[0] || findings[0], manual });
  const planDefault = defaultPlanText({ rec, sug, byService });

  const report = {
    business: name,
    site: host(request.site_url),
    site_url: request.site_url,
    date: now.toISOString(),
    summary: audit.summary || summaryDefault,
    facts,
    counts,
    wins,
    strengths: strong,
    groups: Object.entries(BUCKET_LABEL).map(([k, label]) => ({
      key: k,
      label,
      findings: findings.filter((f) => f.bucket === k).map((f) => {
        const svc = f.service_key ? resolveService(f.service_key) : null;
        return {
          id: f.id, title: f.title, severity: f.severity, area: f.area, evidence: f.evidence, why: f.why, fix: f.fix,
          service: svc ? { name: svc.service, includedWithEveryPlan: svc.includedWithEveryPlan, options: svc.options.map((o) => ({ name: o.name, price: o.price, note: o.note, timeline: o.timeline })) } : null,
        };
      }),
    })),
    manual,
    plan: { text: audit.plan || planDefault, recommended: rec },
    notChecked: clientNotes(audit),
    disclaimer: DISCLAIMER,
  };
  if (admin) {
    report.incomplete = findings.filter((f) => !f.why || !f.fix).map((f) => ({ id: f.id, title: f.title }));
    report.defaults = { summary: summaryDefault, plan: planDefault };
    report.suggested = { once: sug.once, monthly: sug.monthly, winIds: auto.map((f) => f.id) };
    report.choice = { winIds, once: choice.once || "auto", monthly: choice.monthly || "auto" };
  }
  return report;
}
