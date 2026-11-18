# Town pages

One page for each town KODA really serves, at `/website-design-<town>`. The data lives in `src/towns.js`; the page is
`src/pages/TownPage.jsx`.

## Do not publish near-identical pages

Pages that are the same except for the town name are "doorway pages". Google's spam policies target them, they do not
help a customer, and they would go against KODA's honest approach. The page is built so the parts that must be different
for every town come from the data file, and the build refuses to publish a town that is missing them.

Same on every town page: the free mock-up, what we do, how it works, the price, the shared questions, the call to action.

Different for every town (must be true): why this town, the areas we cover there, how we serve it, our work there (optional), and two of its own questions.

## Checklist: does this town deserve its own page?

Answer yes or no. Publish only with at least 5 yes answers, including the first two.

1. We really serve businesses in this town (we meet, call or work with them).
2. We have at least one real client or project there, or a real local reason to be on the page.
3. I can write at least 250 words of true detail that would be wrong for any other town.
4. People search using this town's name (check Search Console or a keyword check).
5. I can say how we serve the town: where we meet, or that we work by phone and video.
6. The page is meaningfully different from the neighbouring town's page.
7. It would still help a real customer if Google did not exist.

Start with a few pages and add a town only when real proof turns up (a client, a local referral).

## Adding a town

1. In `src/towns.js`, replace the town's `draft("slug", "Name")` line with a full entry (there is an example in the file) and fill in every field with real facts. No `[square brackets]` left.
2. Set `live: true`.
3. `npm run build` fails if a live town still has a placeholder, fewer than three areas, or fewer than 80 town-specific words (the shared wording does not count).
   `npm run seo:check` repeats the same checks and the title and description length rules.

Live towns are added to the sitemap by the build, listed under "Website design across Durban" on `/website-design-durban`, and linked from each other town page.

## Seeing a draft

Towns with `live: false` never go on the live site. They show (marked as drafts, with the placeholders highlighted) in
Vercel preview builds, and locally when you build with `TOWN_DRAFTS=1 npm run build`.

A page needs about 80 town-specific words. Add true local detail (a real question a business there asked, a client,
businesses you know) until a town passes.
