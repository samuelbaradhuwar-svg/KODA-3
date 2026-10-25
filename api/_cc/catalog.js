// What KODA can fix and what it costs. The numbers are NOT written here: services, plans, prices and timelines are read
// from src/catalog.js (the same data the website's Services and Pricing sections show). This file only says which
// service and plan answers which kind of finding. Review this mapping; it is the one judgement call in the pricing.
import { SERVICES, PLANS, MONTHLY_PLANS, INCLUDED } from "../../src/catalog.js";

export const SERVICE_MAP = {
  hosting: { included: "Managed hosting", once: ["Starter", "Business"] },
  maintenance: { service: "Website Maintenance", monthly: ["Presence"] },
  seo: { service: "SEO Optimisation", once: ["Business"], monthly: ["Presence", "Growth"] },
  seo_social: { service: "SEO and Social Media", monthly: ["Growth"] },
  redesign: { service: "Website Redesign", once: ["Business"] },
  design: { service: "Website Design", once: ["Starter", "Business"] },
  gbp: { service: "Google Business Profile", once: ["Starter"], monthly: ["Presence"] },
  booking: { service: "Booking Systems", once: ["Custom"] },
  ecommerce: { service: "Ecommerce Stores", once: ["Custom"] },
  branding: { service: "Branding and Logo Design" },
};
export const SERVICE_KEYS = Object.keys(SERVICE_MAP);

export function resolveService(key) {
  const m = SERVICE_MAP[key];
  if (!m) return null;
  const svc = m.service ? SERVICES.find((s) => s.title === m.service) : null;
  const inc = m.included ? INCLUDED.find((s) => s.title === m.included) : null;
  const options = [
    ...(m.once || []).map((n) => PLANS.find((p) => p.name === n)).filter(Boolean).map((p) => ({ kind: "once-off", name: p.name, price: p.price, note: p.note, timeline: p.timeline })),
    ...(m.monthly || []).map((n) => MONTHLY_PLANS.find((p) => p.name === n)).filter(Boolean).map((p) => ({ kind: "monthly", name: p.name, price: p.price, note: p.note, timeline: "Ongoing, month to month" })),
  ];
  return {
    key,
    service: svc?.title || inc?.title || null,
    blurb: svc?.desc || inc?.desc || "",
    includedWithEveryPlan: Boolean(inc),
    options,
  };
}
