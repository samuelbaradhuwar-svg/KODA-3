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
// When an item is marked "Problem" and added as a finding, it becomes a proper finding (title, why, fix, service) instead of
// the checklist question. The owner can edit every word afterwards.
const AS_FINDING = {
  gbp_exists: ["Your Google Business Profile is missing or not verified", "Customers searching for you on Google and Maps rely on this profile. A missing or unverified one is harder to find and harder to trust.", "Create or claim the profile, verify it with Google, and complete it.", "gbp"],
  gbp_complete: ["Your Google Business Profile is not fully filled in", "A complete profile with categories, hours, services and photos gives customers the answers they need and gives Google more to work with.", "Fill in the missing sections and add recent photos.", "gbp"],
  gbp_nap: ["Your name, address or phone number differ between Google and your website", "When the details do not match, customers get confused and Google is less sure which business is yours.", "Use exactly the same business name, address and phone number everywhere.", "gbp"],
  gbp_reviews: ["Your Google reviews need attention", "Reviews are one of the first things customers look at. Few, old or unanswered reviews can put people off.", "Ask happy customers for reviews and reply to the ones you already have.", "gbp"],
  search_visible: ["Your business is hard to find on Google", "If customers searching for your trade and town do not see you, they find your competitors instead.", "Fix the findings in this report and strengthen your Google Business Profile so you are easier to find. We cannot promise a position.", "seo"],
  competitors: ["Local competitors show customers things your site does not", "Customers compare a few businesses before choosing. Showing what others show, such as prices, reviews, photos and easy booking, keeps you in the running.", "Add the things competitors show that you do not, starting with what customers ask about most.", "design"],
  design_first: ["The first impression of the site could be stronger", "Visitors decide within seconds whether a business looks trustworthy and current.", "Refresh the look and layout so the site feels current and credible.", "redesign"],
  design_mobile: ["The site layout on a phone needs attention", "Most customers visit on a phone. Text that is hard to read or buttons that are hard to tap send them away.", "Review each page on a phone and fix text size, spacing and tap targets.", "redesign"],
  copy_clear: ["It is not clear in a few seconds what you offer", "Visitors who cannot tell quickly what you do, who it is for and where you work tend to leave.", "Rewrite the top of the home page to say what you do, who it is for, where you work and what to do next.", "design"],
  copy_quality: ["The writing needs polishing", "Spelling mistakes and unclear wording make a business look less careful.", "Edit the pages for clarity, spelling and tone, and say why a customer should choose you.", "design"],
  photos: ["The photos and brand look need attention", "Real, consistent photos and a clear brand help customers trust you.", "Use real photos of your work and team, and keep the logo, colours and style consistent.", "branding"],
  social: ["Your social profiles need attention", "Out-of-date or hard-to-find social profiles can make a business look inactive.", "Link active profiles from the site and keep them updated.", "seo_social"],
};
for (const m of MANUAL_CHECKLIST) {
  const [title, why, fix, service] = AS_FINDING[m.key];
  m.finding = { title, why, fix, service };
}
export const MANUAL_KEYS = MANUAL_CHECKLIST.map((m) => m.key);
