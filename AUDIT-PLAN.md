# Audit plan: fixing the findings from the heykoda.co.za audit (27 Oct 2026)

Source: `Koda_audit_preview_2710.pdf`, produced by our own command centre. Mobile speed 64, accessibility 100, search 100, best practice 100.
Working rules: one section at a time, built on a `preview/*` branch with a Vercel link, reviewed by Samuel, then merged only on "push".
Update the status column and the log at the bottom as each section moves.

Status key: `todo` | `in progress` | `in review` (preview ready) | `done` (on main and verified) | `blocked` (needs Samuel)

## Section overview

| # | Section | Findings it clears | Owner | Status |
|---|---|---|---|---|
| 1 | Security headers and meta descriptions | Browser security protections missing; descriptions too short or too long | Claude | in review |
| 2 | Audit tool false alarms | Reviews shown (wrong); key pages missing (wrong); contact link (wrong); business name in title (wrong); FAQ page (wrong) | Claude | in review |
| 3 | Phone and WhatsApp | Phone not found; not tap-to-call; no WhatsApp | Samuel decided yes (phone only, no WhatsApp for now); Claude built | in review |
| 4 | Speed on phones | Slow to react on a phone (high priority); site slow on a phone; slow to react on a computer | Claude | in review |
| 5 | Off-site work | Social profiles; Google Business Profile; reviews; photos and brand; findable on search | Samuel (Claude assists) | todo |
| 6 | Content and long term | No blog; no FAQ page; business name; keyword pages | Claude and Samuel | later |

---

## Section 1: Security headers and meta descriptions
**Goal:** the audit no longer flags missing security protections or badly sized descriptions.

Tasks
- [x] Add to `vercel.json`: `Content-Security-Policy`, `X-Frame-Options` (or `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- [x] The CSP must allow what the site really uses: the inline dark-mode script, inline JSON-LD, self-hosted fonts, the Resend and PageSpeed calls made by the server only, and images from the site itself. Test in a preview; check the console for blocked resources on the home page, the Durban page, the legal pages, the audit form and `/command`.
- [x] Trim `/website-design-durban` description from 178 to 160 characters or fewer.
- [x] Expand `/terms` description from 64 to about 120 to 160 characters. Check every page in `PAGES` is between 120 and 160.
- [x] Add a self-test (`scripts/legal-check.mjs` or a new check) that fails when a page description is outside 120 to 160 characters.

Done when (after Samuel reviews and says push): preview deployed, headers verified with a curl or the audit tool on the preview URL, no console CSP errors, hero and audit form still work.

## Section 2: Audit tool false alarms
**Goal:** reports never claim something is working or missing when it is not true. These reports go to clients.

Tasks
- [x] "Reviews or testimonials are shown": require a real review section or review markup, not the word "testimonials" in a feature list. Our site has none (`TESTIMONIALS` is empty), so it must not appear under "already working".
- [x] "Key pages are missing" and "home page does not link to a contact page": count in-page links (`/#contact`, `#services`) and real links with those words as valid.
- [x] "Business name not in the title or heading": compare name variants (domain `heykoda` against `KODA`, case and spacing ignored).
- [x] "No FAQ page": also accept an FAQ section on the page, or FAQ markup.
- [x] Add self-test cases for each of these so they stay fixed.
- [x] Re-run the audit on heykoda.co.za and confirm those five findings are gone or correct.

Done when: a fresh audit of heykoda.co.za no longer shows these five and shows testimonials correctly as missing.

## Section 3: Phone and WhatsApp (blocked on a decision)
**Decision (27 Oct):** Samuel said yes to the phone number on the site, but no WhatsApp integration for now. WhatsApp stays off behind `PHONE.whatsapp = false` in `src/lib/utils.js`.

Tasks (after yes)
- [x] Set `PHONE` in `src/lib/utils.js` (digits and display).
- [x] Visible number in the footer (every page) and contact section, as a `tel:` link.
- [ ] WhatsApp button: deliberately NOT done. To switch on later set `PHONE.whatsapp = true` (turns on the floating button and the Contact link).
- [x] Add the phone to the business markup in `index.html` (`telephone`), `public/llms.txt` and the privacy policy contact table.
- [ ] Samuel: check the Business Profile phone matches exactly (061 244 0166).

Done when: the audit shows the phone found and tap-to-call present. The 'No WhatsApp option' finding will remain until WhatsApp is switched on, by choice.

## Section 4: Speed on phones
**Goal:** mobile speed 85 or better and no long blocking scripts. Measure first, then change one thing at a time.

Tasks
- [x] Baseline: run PageSpeed on the live site (mobile) and record speed, total blocking time and the heaviest scripts.
- [ ] Icons: the `icons` chunk is about 112 KB (29 KB compressed). Not done: it is not a main cause and importing icons one by one is a wider change. Revisit if needed.
- [x] Defer below the fold: load the sections under the hero after first paint.
- [ ] Defer smooth scrolling (Lenis) and the hero animation setup: not done, the hero is above the fold and unchanged on purpose.
- [x] Images: the hidden hero frame photo is now low priority so it no longer competes with fonts and scripts for the first paint. Other images already lazy and in WebP.
- [x] Re-measure after each change and record the numbers in the log.
- [x] Check the hero, dark mode and the services deck still behave on a phone, a phone held sideways and a desktop.

Done when: mobile speed 85 or better (aim for 90), blocking time well under the audit's 200 ms target as far as practical, and no visual regressions.

## Section 5: Off-site work (Samuel, Claude assists)
- [ ] Create or send Instagram, Facebook and LinkedIn links, then add them to `SOCIALS` in `src/content.js` so the footer icons and the markup show them.
- [ ] Google Business Profile: confirm verification status; upload the new cover, a logo, and a few real photos; add services and the description; check Performance for impressions.
- [ ] Ask the first real clients for Google reviews and reply to each one. Do not post fake or incentivised reviews.
- [ ] Add real photos of the work and team where possible.
- [ ] Recheck `/website-design-durban` indexing in Search Console a few days after the request.
- [ ] Finish the Gmail filters in the `hello@` account (separate to this audit).

## Section 6: Content and long term (later)
- [ ] Phase 2 from the earlier plan: service pages and area pages with real explainers.
- [ ] A small blog answering local questions, if we decide to run one.
- [ ] A dedicated FAQ page only if the section on the home page is not enough.
- [ ] Testimonials section filled with real client words, with permission.

---

## Rules for every section
- No invented data, prices, reviews or claims. Ranking is never promised.
- Preview first, then "push". Run the build and `node scripts/audit-selftest.mjs` before each push.
- Mark the section `in review` when the preview is ready, `done` only after it is live and re-checked.

## Log
| Date | Section | Note |
|---|---|---|
| 2026-10-27 | all | Plan created from the audit. Nothing started yet. |
| 2026-10-27 | 1 | Built on `preview/audit-s1`: CSP and four other headers on every page (hashes for the two inline scripts), 3 descriptions fixed (/terms 64 to 130, /refund-policy 71 to 134, /website-design-durban 178 to 152), `scripts/seo-check.mjs` (`npm run seo:check` after a build). Tested in a browser with the exact headers: no blocked resources on home, Durban page, terms and /command at desktop and phone width; an injected inline script is blocked, so the policy is enforced. |
| 2026-10-27 | 1 | Merged to main (`db9c806`). Headers confirmed on the Vercel preview; live recheck still to do after deploy. |
| 2026-10-27 | 2 | Built on `preview/audit-s2`: `api/_cc/crawl.js` (stricter review proof, in-page link targets, FAQ section detection), `search.js` (in-page links count, FAQ section counts, brand-name matching), `conversion.js` (in-page contact link). New self-test block. Ran the real crawler on the built site: pages-missing, no-faq, name-missing and no-contact-page are gone; still reported and correct: no-blog, no-tel, no-whatsapp, trust-reviews. |
| 2026-10-27 | 2 | Merged to main (`326488d`). |
| 2026-10-27 | 3 | Built on `preview/audit-s3`: 061 244 0166 as tap-to-call in the footer and contact section, in the business markup, llms.txt and privacy policy. WhatsApp left off. Removed the footer's duplicate plain-text phone line. Copy tweak: 'A short form or a WhatsApp message is enough' now says 'a phone call'. Real crawler: no-tel gone; no-whatsapp remains by choice. |
| 2026-10-27 | 3 | Merged to main (`4197dc4`). |
| 2026-10-27 | 4 | Built on `preview/audit-s4`. Google's shared PageSpeed quota was used up and the live site is not reachable from here, so I measured with Lighthouse (the same engine) on the built site, served compressed. Calibration: at 24x CPU slowdown the old build scored 61 (the audit said 64). Changes: (1) sections below the first screen load and start up only when within two screens of the viewer (`src/sections.client.js`, `src/lib/near.js`, `#sections` alias in `vite.config.js`; the server build still pre-renders everything), (2) the Services deck reserves its final height in the pre-built HTML so nothing below it moves when it wakes (this fixed deep links landing in the wrong place), (3) low priority for the hidden hero frame photo. Results: standard phone setting score 92 to 94, blocking time 103 ms to 2 ms; 24x slowdown median score 61 to 80, blocking time 2042 ms to 428 ms. Tried and removed: `content-visibility` on lower sections (faster, but it broke jump-to-section positions). Checked: pixel-identical sections (0.00% differ, 12 sections, phone and desktop), 10 deep links and menu clicks land correctly with no layout shift, FAQ, dark mode, forms, all pages load without errors, selftests pass. |
