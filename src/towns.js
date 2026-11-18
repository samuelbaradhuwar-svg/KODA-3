// Town pages: one page for each town the business serves, at /website-design-<slug>. Every town below is a draft until
// its facts are filled in and it is switched on with live: true.
//
// WHY THE FACTS MATTER. Pages that are the same except for the town name are "doorway pages", which Google's spam
// policies target, and they do not help a customer. So a town page only goes live when the parts that must be different
// for every town hold true facts. Nothing here is guessed.
//
// HOW TO MAKE A TOWN LIVE
//  1. Check its entry in TOWNS and fix anything that is wrong. Add a question a business there has really asked.
//     No [square brackets] left.
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

// How KODA serves every town (option B): by phone and video, and in person by arrangement.
// Each entry below holds the suggested areas and one factual sentence about the town, checked against web sources.
// Check the areas against a map and keep only the ones you really serve. The second question still needs a real one.
const entry = (slug, name, why, areas) => ({
  slug,
  name,
  live: false,
  why: [why],
  areas,
  serve: `We work with ${name} businesses by phone and video, and meet in person by arrangement.`,
  work: null,
  // The first two questions use the same wording on every page (marked shared), so they do not count as town-specific.
  // Add a question a business in the town has really asked to make the page more useful, and it will count.
  faqs: [
    { q: `Can you meet me in ${name}?`, a: "Yes, by arrangement. We also work by phone and video.", shared: true },
    { q: "Can you set up my Google Business Profile as well?", a: "Yes. Google Business Profile setup is included with our Starter website.", shared: true },
  ],
});

// The towns and areas around Durban the site will have a page for (the same set as the pages your competitor has,
// plus Durban CBD and Durban North).
export const TOWNS = [
  entry("durban-cbd", "Durban CBD", "Durban's central business district is the city's commercial core, with the beachfront, the Point waterfront, Albert Park and the Warwick Junction transport hub around it.", ["Central Business District", "Albert Park", "Greyville", "Warwick Junction", "The Point", "Berea"]),
  entry("durban-north", "Durban North", "Durban North is a large residential area between the N2 and the coast, with the Umgeni River as its southern boundary. Its suburbs include coastal Glenashley and Virginia, and Briardene is mainly an industrial area.", ["Glenashley", "Virginia", "Parkhill", "Kenville", "Briardene"]),
  entry("umhlanga", "Umhlanga", "Umhlanga is a coastal business and shopping area north of Durban, with the established seafront of Umhlanga Rocks and the newer commercial centre of Umhlanga Ridge around the Gateway shopping centre.", ["Umhlanga Rocks", "Umhlanga Ridge", "La Lucia", "Somerset Park", "La Lucia Ridge"]),
  entry("chatsworth", "Chatsworth", "Chatsworth is a large residential area of Durban made up of many named suburbs, each with its own local shops and businesses.", ["Bayview", "Croftdene", "Crossmoor", "Havenside", "Kharwastan", "Montford", "Silverglen"]),
  entry("ballito", "Ballito", "Ballito is the main town on the Dolphin Coast, north of Durban. It sits in the KwaDukuza municipality, with Shaka's Rock, Salt Rock and Sheffield Beach joined to it along the coast.", ["Ballito", "Shaka's Rock", "Salt Rock", "Sheffield Beach", "Zimbali", "Umhlali", "Tinley Manor"]),
  entry("pinetown", "Pinetown", "Pinetown is a major commercial and industrial centre west of Durban. Westmead is known for manufacturing, automotive and logistics, while suburbs such as Cowies Hill and Sarnia are mainly residential.", ["Cowies Hill", "Westmead", "Sarnia", "Moseley", "Manors", "Mariannhill", "Caversham Glen"]),
  entry("westville", "Westville", "Westville is a suburb of Durban between Sherwood and Pinetown, next to Queensburgh and Reservoir Hills.", ["Westville", "Atholl Heights", "Berea West", "Chiltern Hills", "Dawncliffe", "Dawncrest", "Grayleigh"]),
  entry("queensburgh", "Queensburgh", "Queensburgh is the collective name for several suburbs south-west of Durban, mainly Malvern, Escombe and Northdene.", ["Malvern", "Escombe", "Northdene", "Queensmead (industrial)", "Burlington Greenfields"]),
  entry("reservoir-hills", "Reservoir Hills", "Reservoir Hills is a residential suburb of Durban, north of Westville and Palmiet, named after the reservoir on its highest peak.", ["Reservoir Hills", "Richmond Gardens", "Palmiet", "Clermont"]),
  entry("phoenix", "Phoenix", "Phoenix is a large residential area about 25 km north-west of Durban central, with its own railway station and an industrial area.", ["Phoenix", "Redfern", "Phoenix Industrial"]),
  entry("new-germany", "New Germany", "New Germany is an industrial area in Pinetown, with residential neighbours such as Padfield Park, Manors and Wyebank.", ["New Germany", "Falcon Industrial Park", "Mountain Ridge", "Pineside", "Padfield Park", "Wyebank"]),
  entry("amanzimtoti", "Amanzimtoti", "Amanzimtoti is a coastal town on Durban's south coast, with a string of seaside suburbs to the south, including Doonside, Warner Beach and Winklespruit.", ["Amanzimtoti", "Athlone Park", "Doonside", "Warner Beach", "Winklespruit", "Kingsburgh"]),
];

export const hasPlaceholder = (s) => /\[[^\]]*\]/.test(String(s ?? ""));
const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;

export const townPath = (t) => `/website-design-${t.slug}`;
export const townMeta = (t) => ({
  title: `Website Design in ${t.name} | KODA`,
  description: `Website design for ${t.name} businesses, with SEO and AI SEO. Start with a free website mock-up and a free website audit from KODA.`,
});

// The words that are specific to this town: why, areas, work and the town's own questions. The sentence about how we
// serve the town and the questions marked shared are the same wording on every page, so they do not count.
export const MIN_TOWN_WORDS = 80;
export const townWords = (t) =>
  words([...(t.why || []), ...(t.areas || []), t.work?.name, t.work?.text, ...(t.faqs || []).filter((f) => !f.shared).flatMap((f) => [f.q, f.a])].join(" "));

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
  if (townWords(t) < MIN_TOWN_WORDS) out.push(`only ${townWords(t)} town-specific words (the page needs ${MIN_TOWN_WORDS}): add true local detail to why, areas, a client, or the town's own question and answer`);
  return out;
}

export const routedTowns = () => TOWNS.filter((t) => t.live || SHOW_DRAFTS);
export const townForPath = (p) => routedTowns().find((t) => townPath(t) === p);
