// Town pages: one page for each town the business really serves, at /website-design-<slug>.
//
// WHY THIS FILE EXISTS. Pages that are the same except for the town name are "doorway pages", which Google's spam
// policies target, and they do not help a customer. So a town page only goes live when the parts that must be
// different for every town are filled in with true facts. Nothing is guessed here.
//
// HOW TO ADD A TOWN
//  1. Copy an entry in TOWNS and fill in every field with real facts (no [square brackets] left).
//  2. Run the checklist in TOWNS.md. Publish only with at least 5 yes answers, including the first two.
//  3. Set live: true. The build fails if a live town still has a placeholder, no real work shown, or too little
//     town-specific text, and `npm run seo:check` repeats the same checks.
//
// Drafts (live: false) are never published. They show only in Vercel previews and when you build with TOWN_DRAFTS=1,
// marked as drafts, so you can see the page with its placeholders highlighted.

// The same answers on every town page.
export const TOWN_SHARED_FAQS = [
  { q: "How long does a website take?", a: "Most single page websites launch within five to seven working days. Larger websites usually take two to four weeks." },
  { q: "Can you promise my website will bring in customers?", a: "No, and be careful of anyone who does. A clear, fast website with good SEO and AI SEO gives your business a fair chance of being found, but nobody controls what Google or AI tools show." },
];

const SHOW_DRAFTS = typeof __TOWN_DRAFTS__ !== "undefined" && __TOWN_DRAFTS__;

// Fields that must be different for every town:
//  why    two true sentences about the kinds of businesses you really work with or talk to there
//  serve  how you really serve the town (where you meet, or phone and video)
//  work   a real client or project in the town, with permission: { name, text, href }
//  faqs   at least two questions of your own for this town, including a true answer to "Can you meet me in <town>?"
export const TOWNS = [
  {
    slug: "umhlanga",
    name: "Umhlanga",
    live: false,
    why: [
      "[LOCAL FACT 1: the kinds of businesses you really work with or talk to in Umhlanga. Only what is true.]",
      "[LOCAL FACT 2: something specific you really know about Umhlanga businesses. Delete this line if you have nothing real.]",
    ],
    serve: "[HOW WE SERVE: for example where you can meet Umhlanga businesses, or that you work by phone and video.]",
    work: { name: "[CLIENT OR PROJECT IN UMHLANGA]", text: "[What you built for them and what you did, with their permission.]", href: "/our-work" },
    faqs: [
      { q: "Can you meet me in Umhlanga?", a: "[TRUE ANSWER]" },
      { q: "[A QUESTION AN UMHLANGA BUSINESS HAS REALLY ASKED YOU]", a: "[YOUR ANSWER]" },
    ],
  },
  {
    slug: "pinetown",
    name: "Pinetown",
    live: false,
    why: [
      "[LOCAL FACT 1: the kinds of businesses you really work with or talk to in Pinetown. Only what is true.]",
      "[LOCAL FACT 2: something specific you really know about Pinetown businesses. Delete this line if you have nothing real.]",
    ],
    serve: "[HOW WE SERVE: for example where you can meet Pinetown businesses, or that you work by phone and video.]",
    work: { name: "[CLIENT OR PROJECT IN PINETOWN]", text: "[What you built for them and what you did, with their permission.]", href: "/our-work" },
    faqs: [
      { q: "Can you meet me in Pinetown?", a: "[TRUE ANSWER]" },
      { q: "[A QUESTION A PINETOWN BUSINESS HAS REALLY ASKED YOU]", a: "[YOUR ANSWER]" },
    ],
  },
];

export const hasPlaceholder = (s) => /\[[^\]]*\]/.test(String(s ?? ""));
const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;

export const townPath = (t) => `/website-design-${t.slug}`;
export const townMeta = (t) => ({
  title: `Website Design in ${t.name} | KODA`,
  description: `Website design for ${t.name} businesses, with SEO and AI SEO. Start with a free website mock-up and a free website audit from KODA.`,
});

// Everything that stops a town from going live. An empty list means it is ready.
export function townProblems(t) {
  const out = [];
  const text = [...(t.why || []), t.serve, t.work?.name, t.work?.text, ...(t.faqs || []).flatMap((f) => [f.q, f.a])];
  if (!t.slug || !/^[a-z0-9-]+$/.test(t.slug)) out.push("slug must be lowercase letters, numbers and dashes");
  if (!t.name) out.push("name is missing");
  if (!t.why?.length || t.why.some((s) => !String(s).trim())) out.push("why needs at least one true sentence about the town");
  if (!String(t.serve || "").trim()) out.push("serve is missing (how you serve this town)");
  if (!t.work?.name || !t.work?.text) out.push("work is missing: show a real client or project in this town, or do not publish the page");
  if (!t.faqs || t.faqs.length < 2) out.push("faqs needs at least two questions for this town");
  if (text.some(hasPlaceholder)) out.push("a [square bracket] placeholder is still in the text");
  if (words(text.join(" ")) < 120) out.push("not enough town-specific text (about 120 words or more across why, serve, work and faqs)");
  return out;
}

export const routedTowns = () => TOWNS.filter((t) => t.live || SHOW_DRAFTS);
export const townForPath = (p) => routedTowns().find((t) => townPath(t) === p);
