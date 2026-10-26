// Conversion findings: how clearly the site invites a visitor to act, how easy it is to make contact or book, and what
// proof of trust the pages show. These read the pages' structure and wording; whether the offer is *good* is a manual
// judgement, and the audit says so.
import { bucketFor } from "./technical.js";

const path = (u) => {
  try {
    const x = new URL(u);
    return x.pathname === "/" ? "home page" : x.pathname;
  } catch {
    return String(u).slice(0, 80);
  }
};

export function conversionFindings(crawl) {
  const out = [];
  const add = (id, severity, title, evidence, why, fix, service_key) =>
    out.push({ id, area: "conversion", severity, title, evidence, why, fix, service_key, bucket: bucketFor(severity), include: true, source: "auto" });
  if (!crawl || crawl.site?.homeError) return out;
  const pages = crawl.pages.filter((p) => p.status >= 200 && p.status < 300 && !p.error);
  const home = pages[0];
  if (!home) return out;
  const contact = pages.find((p) => /contact|get-in-touch|enquir|quote/i.test(new URL(p.url).pathname));
  const known = (p) => p.signals !== undefined; // pages crawled before these checks existed have no signal data

  // ---- the offer
  const h1 = (home.h1 || [])[0];
  if (!h1) add("offer-no-h1", "high", "The home page has no clear headline", "No main heading was found on the home page.", "Visitors decide in seconds whether the site is for them. A headline that says what you do and who for is the fastest way to keep them.", "Add a plain headline that says what you do, for whom and where.", "design");
  else {
    const w = h1.split(/\s+/).length;
    if (w < 3 || w > 16) add("offer-h1-length", "low", "The home page headline is very short or very long", `The headline is ${JSON.stringify(h1.slice(0, 90))} (${w} words).`, "A good headline is one clear sentence.", "Rewrite it as one sentence: what you do, for whom, where. Whether the wording works is on the manual checklist.", "design");
  }

  // ---- calls to action
  const ctaHome = home.ctas || [];
  if (!ctaHome.length) add("cta-none", "high", "No clear call to action on the home page", "No button or link with action wording (call, book, get a quote, contact, WhatsApp) was found.", "A visitor who is not told what to do next usually leaves.", "Add a clear primary button near the top, such as \"Get a free quote\", and repeat it further down.", "design");
  else if (ctaHome.length === 1) add("cta-one", "low", "Only one call to action on the home page", `Only found: ${JSON.stringify(ctaHome[0])}.`, "Repeating the next step further down catches visitors who scroll.", "Repeat the main action after each major section.", "design");

  // ---- contact and booking paths
  const homeLinks = (home.links || []).map((l) => { try { return new URL(l).pathname.toLowerCase(); } catch { return ""; } });
  const homeLabels = [...(home.anchors || []), ...(home.linkText || [])].map((t) => String(t).toLowerCase());
  const linksToContact = homeLinks.some((l) => /contact|get-in-touch|enquir|quote/.test(l)) || homeLabels.some((l) => /contact|get-in-touch|enquir|quote/.test(l));
  const anyTel = pages.some((p) => p.tel?.length);
  const anyMail = pages.some((p) => p.mailto?.length);
  const anyWa = pages.some((p) => p.whatsapp);
  const anyForm = pages.some((p) => p.forms > 0);
  if (!anyTel && !anyMail && !anyWa && !anyForm) add("contact-none", "high", "No way to get in touch was found", "No tap-to-call number, email link, WhatsApp link or form was found on the pages read.", "If a customer cannot reach you in one tap, you lose the enquiry.", "Add a phone link, a WhatsApp button and a short enquiry form.", "design");
  else {
    if (!anyTel) add("no-tel", "medium", "The phone number is not tap-to-call", "No tel: link was found on the pages read.", "Most visitors are on a phone and expect to tap a number to call.", "Turn the phone number into a tap-to-call link.", "design");
    if (!anyWa) add("no-whatsapp", "low", "No WhatsApp option", "No WhatsApp link was found.", "In South Africa many customers would rather WhatsApp than phone or email.", "Add a WhatsApp button with a pre-filled message.", "design");
    if (!anyForm) add("no-form", "low", "No enquiry form", "No form was found on the pages read.", "Some visitors will not phone but will fill in a short form.", "Add a short enquiry or quote form.", "design");
  }
  if (pages.length > 1 && !linksToContact && !contact) add("no-contact-page", "medium", "The home page does not link to a contact page", "No link containing \"contact\", \"enquire\" or \"quote\" was found on the home page.", "A visible Contact link is the first thing many visitors look for.", "Add Contact to the menu and the footer.", "design");
  if (contact && !contact.tel?.length && !contact.mailto?.length && !contact.forms && !contact.whatsapp) add("contact-page-empty", "high", "The contact page has no way to make contact", `On ${path(contact.url)} there is no phone link, email link, form or WhatsApp.`, "A contact page that cannot be used loses the most motivated visitors.", "Add the phone, email, form and WhatsApp to the contact page.", "design");
  if (pages.every((p) => p.booking === false)) add("no-booking", "low", "No online booking or quote flow", "No booking tool or booking wording was found on the pages read.", "Customers who can book or request a quote in a couple of taps convert better than ones who have to write an email. Only worth doing if the business takes bookings.", "Add online booking or a quote request flow.", "booking");

  // ---- trust
  const trustPages = pages.filter(known);
  if (trustPages.length) {
    const any = (k) => trustPages.some((p) => p.signals[k]);
    if (!any("testimonials")) add("trust-reviews", "medium", "No customer reviews or testimonials found", `None of the ${trustPages.length} pages read mention reviews, testimonials or star ratings.`, "People trust other customers more than the business. Real reviews are the strongest reason to choose you.", "Show real customer reviews and ratings, with permission, on the home page and service pages.", "design");
    if (!any("proof")) add("trust-proof", "medium", "No examples of past work found", `None of the ${trustPages.length} pages read mention a portfolio, projects, case studies or before-and-after work.`, "Showing finished work answers the first question a new customer has: can you actually do this?", "Add a gallery or a few short case studies.", "design");
    if (!any("guarantee") && !any("credentials")) add("trust-assurance", "low", "No guarantee or credentials found", "No mention of a guarantee, warranty, accreditation, licence, insurance, awards or years in business.", "Concrete assurances lower the risk a customer feels about choosing you. Only add ones that are true.", "State any real guarantees, memberships, accreditations and years of experience.", "design");
  }
  return out;
}
