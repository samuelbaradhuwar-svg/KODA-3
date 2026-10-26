# Audit plan: fixing the findings from the heykoda.co.za audit (27 Oct 2026)

Source: `Koda_audit_preview_2710.pdf`, produced by our own command centre. Mobile speed 64, accessibility 100, search 100, best practice 100.
Working rules: one section at a time, built on a `preview/*` branch with a Vercel link, reviewed by Samuel, then merged only on "push".
Update the status column and the log at the bottom as each section moves.

Status key: `todo` | `in progress` | `in review` (preview ready) | `done` (on main and verified) | `blocked` (needs Samuel)

## Section overview

| # | Section | Findings it clears | Owner | Status |
|---|---|---|---|---|
| 1 | Security headers and meta descriptions | Browser security protections missing; descriptions too short or too long | Claude | todo |
| 2 | Audit tool false alarms | Reviews shown (wrong); key pages missing (wrong); contact link (wrong); business name in title (wrong); FAQ page (wrong) | Claude | todo |
| 3 | Phone and WhatsApp | Phone not found; not tap-to-call; no WhatsApp | Samuel decides, then Claude | blocked (needs yes or no) |
| 4 | Speed on phones | Slow to react on a phone (high priority); site slow on a phone; slow to react on a computer | Claude | todo |
| 5 | Off-site work | Social profiles; Google Business Profile; reviews; photos and brand; findable on search | Samuel (Claude assists) | todo |
| 6 | Content and long term | No blog; no FAQ page; business name; keyword pages | Claude and Samuel | later |

---

## Section 1: Security headers and meta descriptions
**Goal:** the audit no longer flags missing security protections or badly sized descriptions.

Tasks
- [ ] Add to `vercel.json`: `Content-Security-Policy`, `X-Frame-Options` (or `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] The CSP must allow what the site really uses: the inline dark-mode script, inline JSON-LD, self-hosted fonts, the Resend and PageSpeed calls made by the server only, and images from the site itself. Test in a preview; check the console for blocked resources on the home page, the Durban page, the legal pages, the audit form and `/command`.
- [ ] Trim `/website-design-durban` description from 178 to 160 characters or fewer.
- [ ] Expand `/terms` description from 64 to about 120 to 160 characters. Check every page in `PAGES` is between 120 and 160.
- [ ] Add a self-test (`scripts/legal-check.mjs` or a new check) that fails when a page description is outside 120 to 160 characters.

Done when: preview deployed, headers verified with a curl or the audit tool on the preview URL, no console CSP errors, hero and audit form still work.

## Section 2: Audit tool false alarms
**Goal:** reports never claim something is working or missing when it is not true. These reports go to clients.

Tasks
- [ ] "Reviews or testimonials are shown": require a real review section or review markup, not the word "testimonials" in a feature list. Our site has none (`TESTIMONIALS` is empty), so it must not appear under "already working".
- [ ] "Key pages are missing" and "home page does not link to a contact page": count in-page links (`/#contact`, `#services`) and real links with those words as valid.
- [ ] "Business name not in the title or heading": compare name variants (domain `heykoda` against `KODA`, case and spacing ignored).
- [ ] "No FAQ page": also accept an FAQ section on the page, or FAQ markup.
- [ ] Add self-test cases for each of these so they stay fixed.
- [ ] Re-run the audit on heykoda.co.za and confirm those five findings are gone or correct.

Done when: a fresh audit of heykoda.co.za no longer shows these five and shows testimonials correctly as missing.

## Section 3: Phone and WhatsApp (blocked on a decision)
**Decision needed from Samuel:** put 061 244 0166 on the site and add a WhatsApp button, yes or no.

Tasks (after yes)
- [ ] Set `PHONE` in `src/lib/utils.js` (digits and display).
- [ ] Visible number in the footer and contact section, as a `tel:` link.
- [ ] WhatsApp button with a pre-filled message ("Hi KODA, I would like help with a website").
- [ ] Add the phone to the business markup in `index.html` (`telephone`).
- [ ] Check the Business Profile phone matches exactly.

Done when: the audit shows the phone found, tap-to-call present and WhatsApp present.

## Section 4: Speed on phones
**Goal:** mobile speed 85 or better and no long blocking scripts. Measure first, then change one thing at a time.

Tasks
- [ ] Baseline: run PageSpeed on the live site (mobile) and record speed, total blocking time and the heaviest scripts.
- [ ] Icons: the `icons` chunk is about 112 KB. Import only the icons actually used.
- [ ] Defer below the fold: load the sections under the hero after first paint.
- [ ] Defer smooth scrolling (Lenis) and the hero animation setup until the page is interactive, without changing how the hero looks.
- [ ] Images: sizes, lazy loading, modern formats where not already.
- [ ] Re-measure after each change and record the numbers in the log.
- [ ] Check the hero, dark mode and the services deck still behave on a phone, a phone held sideways and a desktop.

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
