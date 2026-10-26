// Things a crawler cannot judge. They are never guessed: each one starts as "not reviewed" and only the owner moves it.
export const MANUAL_STATUSES = ["todo", "ok", "issue", "na"];

export const MANUAL_CHECKLIST = [
  { key: "gbp_exists", group: "Google Business Profile", title: "Profile exists and is verified", check: "Search the business name on Google and Maps. Is there a profile, and does it say verified (no \"Own this business?\" link)?" },
  { key: "gbp_complete", group: "Google Business Profile", title: "Profile is complete", check: "Main and extra categories, opening hours, services, description, a logo, a cover photo and recent photos." },
  { key: "gbp_nap", group: "Google Business Profile", title: "Name, address and phone match the website", check: "The profile and the website show exactly the same business name, address and phone number." },
  { key: "gbp_reviews", group: "Google Business Profile", title: "Reviews: how many, how recent, answered?", check: "Note the star rating, the number of reviews, the date of the latest one, and whether the owner replies." },
  { key: "search_visible", group: "Google search", title: "Where do they appear on Google?", check: "Search the business name, then the trade plus the town (for example \"plumber Durban\"). Note where the site and the profile show up. Do not promise a ranking." },
  { key: "competitors", group: "Google search", title: "How do the top 3 local competitors compare?", check: "Open the first three businesses for the trade plus town. What do they show that this site does not (prices, reviews, photos, booking)?" },
  { key: "design_first", group: "Design", title: "First impression", check: "Open the site on a phone and on a laptop. Does it look current and trustworthy within a few seconds?" },
  { key: "design_mobile", group: "Design", title: "Real phone layout", check: "Scroll the real site on a phone. Is text readable, are buttons easy to tap, does anything overlap or run off screen? The automatic audit cannot see this." },
  { key: "copy_clear", group: "Copy", title: "Is the offer clear in 5 seconds?", check: "Does the top of the home page say what they do, who for and where, and what to do next?" },
  { key: "copy_quality", group: "Copy", title: "Writing quality", check: "Spelling, grammar, tone, and whether the pages say why a customer should choose them." },
  { key: "photos", group: "Design", title: "Photos and brand", check: "Real photos of the business or stock? Consistent logo, colours and style?" },
  { key: "social", group: "Other", title: "Social profiles", check: "Are social links on the site, do they work, and are the profiles active?" },
];
export const MANUAL_KEYS = MANUAL_CHECKLIST.map((m) => m.key);
