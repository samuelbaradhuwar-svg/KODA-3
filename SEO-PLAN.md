# KODA SEO plan

Prepared 9 October 2026. Everything here is qualitative unless marked **verified**. No search volumes, difficulty scores or rankings were available, and none have been invented. Use Google Search Console (free) and Google Keyword Planner (free with a Google Ads account) for real numbers.

## 1. Audit

| Check | Result | Evidence |
|---|---|---|
| Domain indexed by Google | **Unknown.** Cannot be confirmed without Search Console | The audit environment could not reach the live site or Google. A web search for `site:heykoda.co.za` returned nothing, but that tool is not Google's index, so it is not proof either way |
| XML sitemap | Added: `/sitemap.xml` (2 URLs) | `public/sitemap.xml`, served 200 in a local production build |
| robots.txt | Added, allows all, points to the sitemap | `public/robots.txt` |
| Crawlable content | Fixed. The site was an empty JS shell. Every page is now pre-rendered to static HTML | `scripts/prerender.mjs`; headline present with JavaScript switched off |
| Titles / descriptions | Fixed. Unique per page | `index.html`, `PAGES` in `src/App.jsx` |
| Canonical | Set to `https://www.heykoda.co.za/...` (the version you named as official) | Both pages. **Confirm in Vercel that the non-www domain redirects to www** (Settings → Domains) |
| Structured data | `WebSite` + `Organization` (no address, no phone, no ratings) | `index.html` |
| HTTPS | Provided by Vercel once the domain shows Valid Configuration | Confirmed working on your phone |
| Local relevance | Fixed. Site said only "South Africa"; contact map pointed at Cape Town | Now "Durban, South Africa" and Durban map |

### Highest-priority problems found
1. **Fake social proof on the live site.** `src/App.jsx` contains three named testimonials (Cape Town, Johannesburg, Pretoria clients), "4.9/5 average rating from 120+ businesses", a "Trusted by" row of businesses that are not your clients (The Cut Room, Bloom, Local Fuel), and "10+ years / 500+ happy clients" in the barbershop demo. If these are not real, they are misleading to customers and risk a Google spam or trust demotion. I did **not** remove them without your say-so. I did **not** mark them up as reviews or ratings in structured data. Recommend removing or replacing them with real, permissioned testimonials.
2. **Placeholder contact details.** Phone `+27 82 123 4567` and email `hello@koda.co.za` (wrong domain) are placeholders. Google Business Profile, directories and the site must all show the same real details.
3. **Brand ambiguity.** "KODA" matches a singer and other brands, and "heykoda" matches heykoda.ai. The site alone cannot fix this. See section 3.
4. **Single page with no service landing page** (fixed, see below).

## 2. Changes implemented (files)
- `index.html`: title `KODA | Website Design in Durban`, description, canonical (www), Open Graph / Twitter tags, `WebSite` + `Organization` JSON-LD.
- `src/App.jsx`: new `/website-design-durban` page (reuses existing components and styling), per-page metadata (`PAGES`), Durban wording in the hero lead and footer, Durban map, internal links from Services and footer, `/#section` navigation from the sub-page.
- `src/main.jsx`, `src/entry-server.jsx`, `scripts/prerender.mjs`, `package.json`: pre-render every route to static HTML with its own title, description and canonical.
- `public/sitemap.xml`, `public/robots.txt`, `public/og-image.png`: sitemap, robots, social image.
- `vercel.json`: clean URLs, long caching for built assets.
- No layout, branding or framework changes. Visible text changes: hero lead sentence, footer location, the new page.

Chatsworth is **not** published anywhere on the site, to protect your residential address. Say if you want the suburb shown.

## 3. Keyword research

No reliable volume or difficulty data was available. "Priority" is a qualitative judgement. Verify demand in Keyword Planner and Search Console before investing in a page.

| Keyword | Intent | Geo | Commercial value | Volume / difficulty | Target page | Priority |
|---|---|---|---|---|---|---|
| web design Durban | Hire a designer | Durban | High | Not verified | `/website-design-durban`, homepage | 1 |
| website design Durban | Hire a designer | Durban | High | Not verified | Same | 1 |
| website designers Durban | Hire a designer | Durban | High | Not verified | Same | 1 |
| small business website design Durban | Hire, SME | Durban | High, best fit for your market | Not verified | Same | 1 |
| website development Durban | Hire, more technical | Durban | Medium to high | Not verified | Same, or later page if you build custom apps | 2 |
| web design agency / company Durban | Compare providers | Durban | High | Not verified | Same | 2 |
| affordable web design Durban | Price-led | Durban | Medium | Not verified | Homepage pricing; consider only if it fits your positioning | 3 |
| KODA web design | Brand | Local | Medium | Not verified | Homepage | 1 (brand) |
| KODA Durban | Brand | Durban | Medium | Not verified | Homepage | 1 (brand) |
| KODA, hey koda, heykoda.co.za | Brand | n/a | Low to medium | Not verified; heavy confusion with other "Koda" names | Homepage | Brand only, do not expect to win bare "koda" |
| web design Chatsworth / Westville / Pinetown / Umhlanga | Local | Suburb | Unknown | Not verified | **No separate pages yet.** One useful Durban page first | Later, only with unique local content |

Brand advice: use the full phrase "KODA Web Design" on your profiles and website, and keep it consistent. Bare "koda" is unwinnable for now. Do not add extra keywords to your Google Business Profile name.

## 4. Google Search Console
1. Go to https://search.google.com/search-console and sign in with the Google account you want to own the site.
2. Add property → **Domain** → enter `heykoda.co.za` (covers www and non-www).
3. Google shows a **TXT record**. In GoDaddy: My Products → `heykoda.co.za` → DNS → Add New Record → Type TXT, Name `@`, Value the string Google gives you, save. Wait a few minutes, then click Verify. Do not share the token publicly.
4. Open Sitemaps → enter `sitemap.xml` (full URL `https://www.heykoda.co.za/sitemap.xml`) → Submit.
5. Paste `https://www.heykoda.co.za/` into the top search bar (URL Inspection) → Request indexing. Repeat for `https://www.heykoda.co.za/website-design-durban`.
6. Check Pages (Indexing) weekly for errors. "Discovered, not indexed" on a new site is normal for a few weeks.
7. Performance → Queries: filter for **contains "koda"** for brand queries and **contains "durban"** for commercial queries. Watch impressions, clicks, average position.

## 5. Google Business Profile eligibility

Source: Google's guidelines (https://support.google.com/business/answer/3038177) as summarised on 9 October 2026. Re-read the live page before acting.

| Scenario | Eligible? |
|---|---|
| A. Online only, customers never meet you | **No.** Profiles require in-person contact with customers during stated hours. Online-only businesses are explicitly excluded |
| B. Service area business that travels to clients in person | **Potentially yes.** You can hide your address and show a service area. Service area is meant to stay within roughly 2 hours' drive. You still supply an address to Google for verification, but it is not shown |
| C. Physical office customers can visit | **Yes**, if it is your genuine premises, staffed during your stated hours, with signage |
| Virtual office / mailbox / P.O. box | **No.** Google states a rented address you do not operate from is ineligible, and profiles at such addresses are suspended. A coworking space only counts if you actually staff your own dedicated space during stated hours |

Recommendation: the answer depends on how you really work.
- If you **meet clients at their premises in Durban**, you can qualify as a service area business and hide your home address. This is the cheapest legitimate route and needs no office.
- If you **work only online**, you do not qualify. Do not rent a virtual office to get around this. It would not make you eligible and risks suspension. Continue with organic SEO.
- Renting a virtual office is only worth it for a genuine non-Google reason (for example a registered business address). It does not help here.

**Questions I need you to answer** before you create a profile:
1. Do you visit clients at their business premises in Durban, or meet them in person anywhere?
2. Will you be reachable during stated hours, and which hours?
3. What real business phone number and email will you publish?

**If eligible, setup** (https://business.google.com/create): name exactly "KODA" (no added keywords); primary category "Website designer" (or the closest available); secondary categories only if true; write a truthful description; list real services; add the website `https://www.heykoda.co.za`; choose "I deliver goods and services to my customers at their location", hide the address, set the service area; verify using Google's offered method (video or phone). Do not create duplicates. Ask real clients to leave honest reviews by sharing your profile's review link. Never buy or incentivise reviews.

## 6. Local authority (legitimate only)
- Real testimonials and case studies, with the client's written permission.
- Link to `https://www.heykoda.co.za` from your Instagram, Facebook and LinkedIn, and add "Built by KODA" with a link to the footer of sites you built (Blooming Bilingual, Trynetix), with their owners' agreement.
- Free, relevant South African business directories only if they accept service-area businesses or let you hide the address. Check each directory's rules. Do not publish a virtual-office address.
- Keep name, phone and email identical everywhere.

## 7. 90-day plan

**Days 1 to 30 (free)**
| Task | Why | Measure |
|---|---|---|
| Deploy this branch; confirm www/non-www redirect in Vercel | Single canonical version | Both URLs end on www |
| Set up Search Console, sitemap, request indexing | Get crawled | Pages report shows both URLs indexed |
| Replace placeholder phone/email; remove or replace fake testimonials and stats | Trust, compliance | Site shows only real details |
| Answer the eligibility questions above | Decide on a profile | Decision made |

**Days 31 to 60 (free, optional paid)**
| Task | Why | Measure |
|---|---|---|
| Create the Google Business Profile if eligible and verify it | Local pack and Maps | Profile live |
| Add 1 to 3 real, permissioned testimonials and case studies | Credibility | Published |
| Check Keyword Planner for real demand; refine the target page copy | Remove guesswork | Keyword table updated with real data |
| Add social profile links to the footer (currently `#`) | Brand signals | Links live |

**Days 61 to 90**
| Task | Why | Measure |
|---|---|---|
| Review Search Console queries and pages | Learn what works | Impressions and clicks trending up |
| Add pages only for queries with real demand and unique content | Avoid thin pages | New pages index |
| Ask for 3 to 5 genuine reviews | Social proof | Reviews on profile |
| Optional paid: Google Ads for "web design Durban" | Faster visibility | Enquiries per rand |

No ranking, traffic or enquiry results are guaranteed. New sites typically take weeks to months to stabilise in search.
