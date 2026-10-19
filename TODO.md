# KODA: what is left before the project is finished

Tick items off as they are done. `npm run legal:check` reports the legal items automatically.

## Legal and compliance (blocking: the legal pages are still drafts)
- [ ] **Register your Information Officer with the Information Regulator** (POPIA). Not done yet. For a sole proprietor this is the owner. Then set `LEGAL.informationOfficerRegistered = true` in `src/legal-config.js`.
- [ ] Fill in the business details in `src/legal-config.js`: registered name, type of business, a business address you are happy to publish, Information Officer. If the business itself is not registered yet (CIPC), decide the legal form first.
- [ ] Attorney review of the privacy, terms, refund and cookie pages, then set `LEGAL.reviewed = true` to remove the "Draft" notice.
- [ ] Confirm whether you are VAT registered; if so, show VAT-inclusive prices.
- [ ] Confirm every promise on the site is one you can keep: free homepage mock-up, specialist audit by hand, hosting with SSL/backups/monitoring on every plan, five to seven working day timeline.
- [ ] Written permission from the two portfolio clients (The Blooming Bilingual, Trynetix) to show their sites and names.
- [ ] Confirm the source and licence of the hero shader code, and that the og-image is wholly your own artwork.

## Make the free audit work for real
- [ ] Verify heykoda.co.za in Resend (SPF and DKIM), so emails reach real customers.
- [ ] In Vercel add: `RESEND_API_KEY`, `AUDIT_MODE=live`, `PAGESPEED_API_KEY`, `ANTHROPIC_API_KEY`, then redeploy.
- [ ] Run one real audit with your own email and check the PDF arrives at the next business-hours slot.
- [ ] Decide who follows up on specialist audit requests, and how fast, so the promise on the site is kept.

## Trust and visibility
- [ ] Real testimonials (the section appears automatically once added in `src/content.js`).
- [ ] Founder photo and short story.
- [ ] Real phone number and WhatsApp number (`src/lib/utils.js`), and social profile links (`src/content.js`).
- [ ] Set up the Google Business Profile and Google Search Console.
- [ ] More portfolio projects.

## Housekeeping
- [ ] Delete the old preview branches on GitHub (https://github.com/samuelbaradhuwar-svg/KODA-3/branches): `preview/brand-polish`, `preview/compliance-1-wording`, `preview/compliance-2-forms`, `preview/compliance-3-policies`, `preview/ecommerce-custom-code`, `preview/free-audit`, `preview/hero-audit`, `preview/hero-pill-mobile`, `preview/legal-compliance`, `preview/trust-and-pricing`. Keep `claude/new-session-kcqrga`, which the site deploys from.
- [ ] Screen reader pass (VoiceOver or NVDA) on the whole site.
