// Town pages: one page for each town the business serves, at /website-design-<slug>. Every town below is a draft until
// its facts are filled in and it is switched on with live: true.
//
// WHY THE FACTS MATTER. Pages that are the same except for the town name are "doorway pages", which Google's spam
// policies target, and they do not help a customer. So a town page only goes live when the parts that must be different
// for every town hold true facts. Nothing here is guessed.
//
// HOW TO MAKE A TOWN LIVE
//  1. Replace its draft("slug", "Name") line with a full entry (copy the example below) and fill in every field with
//     real facts. No [square brackets] left.
//  2. Run the checklist in TOWNS.md.
//  3. Set live: true. The build fails if a live town still has a placeholder or too little town-specific text, and
//     `npm run seo:check` repeats the same checks.
//
// Drafts (live: false) are never published. They show only in Vercel previews and when you build with TOWN_DRAFTS=1,
// marked as drafts, so you can see every town page with its placeholders highlighted.

// The same answers on every town page.
export const TOWN_SHARED_FAQS = [
  { q: "How long does a website take?", a: "Most single page websites launch within five to seven working days. Larger websites usually take two to four weeks." },
  { q: "Can you promise my website will bring in customers?", a: "No, and be careful of anyone who does. A clear, fast website with good SEO and AI SEO gives your business a fair chance of being found, but nobody controls what Google or AI tools show." },
];

const SHOW_DRAFTS = typeof __TOWN_DRAFTS__ !== "undefined" && __TOWN_DRAFTS__;

// Fields that must be different for every town:
//  why    one or two true sentences about the kinds of businesses you really work with or talk to there
//  areas  the suburbs or areas of the town you really serve (three or more)
//  serve  how you really serve the town (where you meet, or phone and video)
//  work   optional: a real client or project in the town, with permission: { name, text, href }
//  faqs   at least two questions of your own for this town, including a true answer to "Can you meet me in <town>?"
//
// Example of a finished entry:
//  {
//    slug: "umhlanga", name: "Umhlanga", live: true,
//    why: ["...a true sentence...", "...another..."],
//    areas: ["Umhlanga Rocks", "Umhlanga Ridge", "La Lucia"],
//    serve: "...how you really serve this town...",
//    work: { name: "Client name", text: "What you built for them.", href: "/our-work" },   // or leave work out
//    faqs: [{ q: "Can you meet me in Umhlanga?", a: "..." }, { q: "A question a local business asked", a: "..." }],
//  },
const draft = (slug, name) => ({
  slug,
  name,
  live: false,
  why: [
    `[LOCAL FACT 1: the kinds of businesses you really work with or talk to in ${name}. Only what is true.]`,
    `[LOCAL FACT 2: something specific you really know about ${name} businesses. Delete this line if you have nothing real.]`,
  ],
  areas: [`[AREA 1 of ${name} you serve]`, `[AREA 2 of ${name} you serve]`, `[AREA 3 of ${name} you serve]`],
  serve: `[HOW WE SERVE: for example where you can meet ${name} businesses, or that you work by phone and video.]`,
  work: null,
  faqs: [
    { q: `Can you meet me in ${name}?`, a: "[TRUE ANSWER]" },
    { q: `[A QUESTION A ${name.toUpperCase()} BUSINESS HAS REALLY ASKED YOU]`, a: "[YOUR ANSWER]" },
  ],
});

// The towns and areas around Durban the site will have a page for (the same set as the pages your competitor has).
export const TOWNS = [
  draft("durban-cbd", "Durban CBD"),
  draft("durban-north", "Durban North"),
  draft("umhlanga", "Umhlanga"),
  draft("chatsworth", "Chatsworth"),
  draft("ballito", "Ballito"),
  draft("pinetown", "Pinetown"),
  draft("westville", "Westville"),
  draft("queensburgh", "Queensburgh"),
  draft("reservoir-hills", "Reservoir Hills"),
  draft("phoenix", "Phoenix"),
  draft("new-germany", "New Germany"),
  draft("amanzimtoti", "Amanzimtoti"),
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
  const text = [...(t.why || []), ...(t.areas || []), t.serve, t.work?.name, t.work?.text, ...(t.faqs || []).flatMap((f) => [f.q, f.a])];
  if (!t.slug || !/^[a-z0-9-]+$/.test(t.slug)) out.push("slug must be lowercase letters, numbers and dashes");
  if (!t.name) out.push("name is missing");
  if (!t.why?.length || t.why.some((s) => !String(s).trim())) out.push("why needs at least one true sentence about the town");
  if (!t.areas || t.areas.length < 3 || t.areas.some((s) => !String(s).trim())) out.push("areas needs at least three suburbs or areas you really serve");
  if (!String(t.serve || "").trim()) out.push("serve is missing (how you serve this town)");
  if (t.work && (!t.work.name || !t.work.text)) out.push("work needs both a name and text, or remove it");
  if (!t.faqs || t.faqs.length < 2) out.push("faqs needs at least two questions for this town");
  if (text.some(hasPlaceholder)) out.push("a [square bracket] placeholder is still in the text");
  if (words(text.join(" ")) < 100) out.push("not enough town-specific text (about 100 words or more across why, areas, serve, work and faqs)");
  return out;
}

export const routedTowns = () => TOWNS.filter((t) => t.live || SHOW_DRAFTS);
export const townForPath = (p) => routedTowns().find((t) => townPath(t) === p);
