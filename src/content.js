import SHOT_BLOOMING from "./assets/photo-blooming-bilingual.webp";
import SHOT_TRYNETIX from "./assets/photo-trynetix.webp";

export { SERVICES, PLANS, MONTHLY_PLANS, INCLUDED } from "./catalog.js";

export const NAV_LINKS = [
  { label: "Work", id: "portfolio" },
  { label: "Services", id: "services" },
  { label: "Pricing", id: "pricing" },
  { label: "Free audit", id: "audit" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

export const TICKER = ["Websites", "Google Business profiles", "Google Workspace", "Branding and logos", "Local SEO", "Booking systems", "Online stores", "Ongoing care"];

export const PRESENCE = [
  {
    title: "Email that looks like a business",
    desc: "name@yourbusiness.co.za builds trust in every message. A free Gmail or Hotmail address does not.",
  },
  {
    title: "Everything on your own domain",
    desc: "Google Workspace gives you Gmail, Calendar, Meet video calls and Drive, all under your business name.",
  },
  {
    title: "Found when customers search",
    desc: "A website and a Google Business profile help you appear on Google Search and Maps when people look for what you do.",
  },
  {
    title: "One story everywhere",
    desc: "The same name, details and look across your site, profile, email and social pages makes you easy to trust and easy to remember.",
  },
];

export const PROJECTS = [
  {
    name: "The Blooming Bilingual",
    category: "Online English tutoring",
    blurb: "A website for one-to-one online English lessons, with lesson credits, open-slot booking and a student login.",
    tag: "Website + Online Booking",
    url: "https://www.thebloomingbilingual.com/",
    src: SHOT_BLOOMING,
    host: "thebloomingbilingual.com",
    width: 1100,
    height: 497,
  },
  {
    name: "Trynetix",
    category: "B2B lead generation",
    blurb: "A clear, confident site for an outbound lead generation and appointment setting agency headquartered in Durban.",
    tag: "Website Design",
    url: "https://trynetix.com/about",
    src: SHOT_TRYNETIX,
    host: "trynetix.com",
    width: 1100,
    height: 480,
  },
];


export const PROCESS = [
  { n: "01", title: "Discover", desc: "We learn about your business, what you offer and who your customers are." },
  { n: "02", title: "Design", desc: "We build a professional website and set up your Google Business profile." },
  { n: "03", title: "Launch", desc: "We take you live, so customers can find you on Google, Maps and social." },
  { n: "04", title: "Grow", desc: "We keep your website and online presence up to date so you stay easy to find." },
];

export const WHY_US = [
  { title: "Built for speed", desc: "Lean, modern pages that load quickly, so visitors are not kept waiting." },
  { title: "Mobile friendly", desc: "Designed for phones first, because most of your customers are on them." },
  { title: "Secure hosting", desc: "SSL, backups and monitoring included, so your site stays online and protected." },
  { title: "Clear timelines", desc: "Single page sites typically launch within five to seven working days. Larger projects take longer, and we agree the timeline with you first." },
];

export const OUTCOMES = [
  { title: "Easier to find", desc: "A website and Google profile make it easier for customers to find you and get in touch." },
  { title: "Easier to trust", desc: "A clear, professional site with your details in one place helps people feel confident about contacting you." },
  { title: "Easier to contact", desc: "WhatsApp, email and a simple form on every page, so enquiring takes seconds." },
  { title: "Always open", desc: "Your website is available around the clock, so customers can learn about you whenever suits them." },
];


// Monthly plans. Proposed starting prices with fixed monthly allowances, not unlimited work.

// Real client quotes only. Add them as { name, role, city, text } and the "Client stories" section appears on its own.
// The sample quotes that were here were placeholders, so they are removed until real ones are available.
export const TESTIMONIALS = [];

// Clients shown under the hero. Only work that is on this site: the two projects in PROJECTS.
export const TRUSTED = ["The Blooming Bilingual", "Trynetix"];

// What every plan includes. Taken from the answers in FAQS, so nothing here is new.

// A free homepage mock-up before any payment. Set to false to hide the offer on the pricing section.
export const MOCKUP_OFFER = true;

// The four steps of the free mock-up offer. Nothing here promises a number of days.
export const MOCKUP_STEPS = [
  { title: "Tell us about your business", desc: "A short form or a WhatsApp message is enough." },
  { title: "We design your homepage", desc: "A free mock-up, on a link you can open on your phone." },
  { title: "You decide", desc: "Like it and we build the rest. If not, you owe nothing." },
  { title: "We build and launch", desc: "Your full website, with Google set-up if you want it." },
];

// Straight talk: what we will and will not promise.
export const STRAIGHT_TALK = [
  { title: "A written quote", desc: "It lists exactly what is included, so there are no surprises." },
  { title: "People who reply", desc: "We reply to every enquiry within one working day." },
  { title: "Honest talk about results", desc: "We never promise a ranking, a number of calls, or a date we cannot keep." },
];

// "Why not a DIY builder or the cheapest quote?" Generic and fair, no named competitors.
export const COMPARE = {
  cols: ["DIY website builder", "Cheapest quote", "KODA"],
  rows: [
    { label: "Who builds it", tones: ["con", "con", "pro"], vals: ["You, in your own time", "Often a reused template", "We design and build it for you"] },
    { label: "Google set-up", tones: ["con", "con", "pro"], vals: ["You work it out yourself", "Often extra, or not included", "Google Business Profile and SEO set-up available"] },
    { label: "Hosting and security", tones: ["mid", "mid", "pro"], vals: ["A monthly plan you manage", "Varies", "Managed hosting with SSL, backups and monitoring"] },
    { label: "Who you talk to", tones: ["mid", "mid", "pro"], vals: ["Help articles and forums", "Varies", "The people who built your site"] },
    { label: "Asking for a change", tones: ["con", "mid", "pro"], vals: ["You make it yourself", "Varies", "Send us a message and we do it, covered by our monthly plans"] },
    { label: "After launch", tones: ["mid", "mid", "pro"], vals: ["Help articles and forums", "Varies", "Support included on every plan"] },
    { label: "Price", tones: ["mid", "pro", "plain"], vals: ["Monthly, plus your time", "Low upfront price", "From R3,499 once off"] },
  ],
};

export const FAQS = [
  { q: "How long does a website take?", a: "Most single page sites launch within five to seven working days. Websites with multiple pages, or those with a booking system or ecommerce store, typically take two to four weeks, depending on content and revisions." },
  { q: "Do you provide hosting?", a: "Yes. Every website we build includes secure, managed hosting with SSL, backups and uptime monitoring, so you never have to think about the technical side." },
  { q: "Can I update my website?", a: "Yes, and we do it for you. There is no editor to learn or accidentally break. Tell us what to change and we take care of it, with ongoing updates, backups and security covered by our monthly plans." },
  { q: "Do you provide support?", a: "Yes. Every plan includes support after launch, and our maintenance service covers ongoing updates, security monitoring and small changes for a flat monthly fee." },
  { q: "Can you help if I only have an idea?", a: "Yes. Plenty of businesses start with just a name or a sketch. We can design your logo and brand look first, then build your website and set up Google, at a pace that suits you. There is no pressure and no obligation." },
  { q: "Do you design logos and brands?", a: "Yes. We design logos and a simple brand look (colours, type and style), so your website, Google profile, email and social pages all feel like one business. Ask us for a quote when you get in touch." },
  { q: "Do I need to know anything technical to get started?", a: "No. We handle the strategy, design, build and setup from start to finish. All we need from you is a short call about your business." },
];

// Add real profile links here and the footer icons appear. Empty links are hidden.
export const SOCIALS = [
  { label: "Instagram", url: "" },
  { label: "Facebook", url: "" },
  { label: "LinkedIn", url: "" },
];

export const PAGES = {
  "/privacy-policy": { title: "Privacy Policy | KODA", description: "How KODA collects, uses and protects personal information, in line with South Africa's Protection of Personal Information Act (POPIA)." },
  "/terms": { title: "Terms and Conditions | KODA", description: "The terms that apply when you use the KODA website, request our free website check or ask us about a web design project in Durban." },
  "/refund-policy": { title: "Refund Policy | KODA", description: "When and how KODA refunds payments for web design and related services in South Africa, in plain English, and how to ask for a refund." },
  "/cookie-policy": { title: "Cookie Policy | KODA", description: "KODA does not use tracking or advertising cookies. This page explains what the site does and does not store on your device." },
  "/": {
    title: "Website Design Durban | Small Business Websites | KODA",
    description: "Durban web design studio. Fast, mobile friendly websites from R3,499, with Google Business Profile and SEO set-up. Get a free homepage mock-up first.",
  },
  "/website-design-durban": {
    title: "Website Design in Durban for Small Businesses | KODA",
    description:
      "Website design in Durban for small businesses: websites, ecommerce, booking, logos, Google Business Profile and SEO. From R3,499. Free homepage mock-up.",
  },
};

export { BUSINESS, LEGAL, LEGAL_LINKS } from "./legal-config.js";
