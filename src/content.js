import SHOT_BLOOMING from "./assets/photo-blooming-bilingual.webp";
import SHOT_TRYNETIX from "./assets/photo-trynetix.webp";

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

export const SERVICES = [
  { title: "Website Design", desc: "Professional websites built around how your customers search, browse and buy, with WhatsApp and Google Maps built in." },
  { title: "Branding and Logo Design", desc: "A logo and a clear brand look (colours, type and style) so your business looks the same everywhere, from your website to your social pages. A good place to start if all you have is an idea." },
  { title: "Website Redesign", desc: "A modern rebuild of your existing site: the same business, with a sharper design and a faster, cleaner build." },
  { title: "Ecommerce Stores", desc: "Fully functional online stores with secure checkout, inventory management and shopping flows designed for mobile." },
  { title: "Booking Systems", desc: "Let customers book appointments, tables or services online, 24/7, without a single phone call." },
  { title: "Google Business Profile", desc: "We set up and optimise your profile so your business can show up on Google Search and Maps when local customers look for you." },
  { title: "SEO Optimisation", desc: "On page and technical SEO that helps your website get found by people who are looking for what you offer. We cannot promise a particular ranking." },
  { title: "Website Maintenance", desc: "Ongoing updates, backups and security monitoring to help keep your site fast, safe and online." },
  { title: "Google Workspace and Email", desc: "Professional @yourbusiness email on Google Workspace, with Gmail, Calendar, Meet and Drive on your own domain, so every message builds credibility." },
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

export const PLANS = [
  {
    name: "Starter",
    price: "R3,499",
    note: "once off",
    desc: "A polished single page presence for businesses just getting online.",
    features: [
      "One page website",
      "WhatsApp button and contact form",
      "Google Maps integration",
      "Basic SEO setup",
      "Managed hosting with SSL, backups and monitoring",
      "Google Business Profile setup",
      "Google Workspace email setup (Google's per-user fee is paid separately)",
    ],
    cta: "Get started",
  },
  {
    name: "Business",
    price: "R7,999",
    note: "once off",
    desc: "A complete website with several pages, built to win trust and generate leads.",
    features: ["Everything in Starter", "Five page website", "Photo gallery and testimonials", "On page SEO and Google indexing setup"],
    highlighted: true,
    badge: "Most popular",
    cta: "Get started",
  },
  {
    name: "Custom",
    price: "From R14,999",
    note: "custom quote",
    desc: "For businesses that book or sell online and need a site to match.",
    features: ["Everything in Business", "Online booking system or online store", "Advanced SEO", "Custom integrations", "Priority support"],
    cta: "Get a quote",
  },
];

// Monthly plans. Proposed starting prices with fixed monthly allowances, not unlimited work.
export const MONTHLY_PLANS = [
  {
    name: "Presence",
    price: "From R1,499",
    note: "/ month",
    desc: "For businesses establishing their online presence.",
    features: ["Website maintenance", "Basic SEO optimisation", "Google Business Profile management", "4 social media posts monthly", "Monthly performance report"],
    cta: "Start with Presence",
  },
  {
    name: "Growth",
    price: "From R2,999",
    note: "/ month",
    desc: "For businesses wanting consistent digital growth.",
    features: [
      "Everything included in Presence",
      "Ongoing SEO management",
      "8 social media posts monthly",
      "2 promotional campaigns monthly",
      "Content strategy",
      "Website traffic and lead tracking",
      "Monthly growth report",
    ],
    highlighted: true,
    badge: "Recommended",
    cta: "Start growing",
  },
  {
    name: "Performance",
    price: "From R4,999",
    note: "/ month",
    desc: "For businesses wanting a comprehensive digital marketing operation.",
    features: [
      "Everything included in Growth",
      "12 social media posts monthly",
      "4 marketing campaigns monthly",
      "Advanced SEO strategy",
      "Conversion optimisation",
      "Google Ads campaign management",
      "Competitor monitoring",
      "Detailed monthly reporting",
    ],
    cta: "Start with Performance",
  },
];

// Real client quotes only. Add them as { name, role, city, text } and the "Client stories" section appears on its own.
// The sample quotes that were here were placeholders, so they are removed until real ones are available.
export const TESTIMONIALS = [];

// Clients shown under the hero. Only work that is on this site: the two projects in PROJECTS.
export const TRUSTED = ["The Blooming Bilingual", "Trynetix"];

// What every plan includes. Taken from the answers in FAQS, so nothing here is new.
export const INCLUDED = [
  { title: "Managed hosting", desc: "Secure hosting with SSL, backups and uptime monitoring." },
  { title: "Built for phones", desc: "Designed phone first, because most of your customers are on one." },
  { title: "Edit it yourself", desc: "A simple content editor, or we make the changes for you." },
  { title: "Support after launch", desc: "Every plan includes support once you are live." },
];

// A free homepage mock-up before any payment. Set to false to hide the offer on the pricing section.
export const MOCKUP_OFFER = true;

// "Why not a DIY builder or the cheapest quote?" Generic and fair, no named competitors.
export const COMPARE = {
  cols: ["DIY website builder", "Cheapest quote", "KODA"],
  rows: [
    { label: "Who builds it", vals: ["You, in your own time", "Often a reused template", "We design and build it for you"] },
    { label: "Google set-up", vals: ["You work it out yourself", "Often extra, or not included", "Google Business Profile and SEO set-up available"] },
    { label: "Hosting and security", vals: ["A monthly plan you manage", "Varies", "Managed hosting with SSL, backups and monitoring"] },
    { label: "After launch", vals: ["Help articles and forums", "Varies", "Support included on every plan"] },
    { label: "Price", vals: ["Monthly, plus your time", "Low upfront price", "From R3,499 once off"] },
  ],
};

export const FAQS = [
  { q: "How long does a website take?", a: "Most single page sites launch within five to seven working days. Websites with multiple pages, or those with a booking system or ecommerce store, typically take two to four weeks, depending on content and revisions." },
  { q: "Do you provide hosting?", a: "Yes. Every website we build includes secure, managed hosting with SSL, backups and uptime monitoring, so you never have to think about the technical side." },
  { q: "Can I update my website?", a: "Absolutely. We build every site with a simple content editor so you can update text, images and offers yourself, and we're always on hand if you'd rather we do it." },
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
  "/terms": { title: "Terms and Conditions | KODA", description: "The terms for using the KODA website and our free website check." },
  "/refund-policy": { title: "Refund Policy | KODA", description: "When and how KODA refunds payments for web design and related services." },
  "/cookie-policy": { title: "Cookie Policy | KODA", description: "KODA does not use tracking or advertising cookies. This page explains what the site does and does not store on your device." },
  "/": {
    title: "KODA | Website Design in Durban",
    description:
      "KODA is a Durban web design studio. We build fast, professional websites for small and medium sized businesses, set up your Google Business profile and help customers find you.",
  },
  "/website-design-durban": {
    title: "Website Design in Durban for Small Businesses | KODA",
    description:
      "Professional website design in Durban for small and medium sized businesses. KODA designs and builds websites, sets up Google Business profiles and handles SEO. Book a free consultation.",
  },
};

export { BUSINESS, LEGAL, LEGAL_LINKS } from "./legal-config.js";
