// Services, plans and prices. Plain data with no imports, so both the website (via content.js) and the private
// command centre API can read the same numbers. Edit here; nothing else holds a copy of a price.

export const SERVICES = [
  { title: "Website Design", desc: "Professional websites built around how your customers search, browse and buy, with WhatsApp and Google Maps built in." },
  { title: "Branding and Logo Design", desc: "A logo and a clear brand look (colours, type and style) so your business looks the same everywhere, from your website to your social pages. A good place to start if all you have is an idea." },
  { title: "Website Redesign", desc: "A modern rebuild of your existing site: the same business, with a sharper design and a faster, cleaner build." },
  { title: "Ecommerce Stores", desc: "Fully functional online stores with secure checkout, inventory management and shopping flows designed for mobile." },
  { title: "Booking Systems", desc: "Let customers book appointments, tables or services online, 24/7, without a single phone call." },
  { title: "Google Business Profile", desc: "We set up and optimise your profile so your business can show up on Google Search and Maps when local customers look for you." },
  { title: "SEO Optimisation", desc: "On page and technical SEO that helps your website get found by people who are looking for what you offer. We cannot promise a particular ranking." },
  { title: "Website Maintenance", desc: "Ongoing updates, backups and security monitoring to help keep your site fast, safe and online." },
  { title: "SEO and Social Media", desc: "Search visibility and social content working together, so more of the right people find you, follow you and get in touch." },
];

export const PLANS = [
  {
    name: "Starter",
    timeline: "5 to 7 working days",
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
    timeline: "2 to 4 weeks",
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
    timeline: "Agreed with you",
    price: "From R14,999",
    note: "custom quote",
    desc: "For businesses that book or sell online and need a site to match.",
    features: ["Everything in Business", "Online booking system or online store", "Advanced SEO", "Custom integrations", "Priority support"],
    cta: "Get a quote",
  },
];

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

export const INCLUDED = [
  { title: "Managed hosting", desc: "Secure hosting with SSL, backups and uptime monitoring." },
  { title: "Built for phones", desc: "Designed phone first, because most of your customers are on one." },
  { title: "We look after updates", desc: "No editor to learn. Tell us what to change and we take care of it, covered by our monthly plans." },
  { title: "Support after launch", desc: "Every plan includes support once you are live." },
];
