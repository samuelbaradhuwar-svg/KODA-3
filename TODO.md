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
- [ ] Verify heykoda.co.za in Resend (its own DKIM record is separate from Google's), so emails reach real customers. Then set `AUDIT_NOTIFY_TO=hello@heykoda.co.za` and `AUDIT_FROM` in Vercel.
- [ ] In Vercel add: `RESEND_API_KEY`, `AUDIT_MODE=live`, `PAGESPEED_API_KEY`, `ANTHROPIC_API_KEY`, then redeploy.
- [ ] Run one real audit with your own email and check the PDF arrives at the next business-hours slot.
- [ ] Decide who follows up on specialist audit requests, and how fast, so the promise on the site is kept.

## Trust and visibility
- [ ] Real testimonials (the section appears automatically once added in `src/content.js`).
- [ ] Founder photo and short story.
- [ ] Real phone number and WhatsApp number (`src/lib/utils.js`), and social profile links (`src/content.js`).
- [x] Google Workspace set up for heykoda.co.za (mailbox `hello@`, alias `info@`, SPF and DKIM records at GoDaddy). Done 21 Oct 2026.
- [x] Google Search Console: domain property verified and `sitemap.xml` submitted. Done 21 Oct 2026.
- [ ] Google Business Profile: created, waiting for verification (a video check usually takes 1 to 5 working days). Once verified, add the profile link to the footer and contact section.
- [ ] Turn on 2-Step Verification for `hello@heykoda.co.za`, and keep a note of the recovery codes.
- [ ] Add the `_dmarc` TXT record at GoDaddy (`v=DMARC1; p=none; rua=mailto:hello@heykoda.co.za`) once mail has run cleanly for a week.
- [ ] Remove the Google Admin connection in Composio (and optionally the OAuth client in Google Cloud) now the alias is done.
- [ ] Put a reminder in the calendar for 31 Oct 2026: the Workspace free trial ends 3 Nov and the card is charged then.
- [ ] Trade mark check for "KODA" (CIPC register and WIPO global database). Other businesses use "Koda" and "HeyKoda.ai" for software.
- [ ] More portfolio projects.

## KODA Autopilot (Phase 1 go-live; see docs/AUTOPILOT-SETUP.md)
- [ ] Create the Supabase project, run `autopilot/db/migrations/0001_autopilot_init.sql`, create your admin login and add your email to `ap_admins`.
- [ ] Add the Autopilot environment variables in Vercel (generate the secrets yourself), keep `AUTOPILOT_DRY_RUN=1`, redeploy.
- [ ] Run the client zero pilot (self-test, approval email, kill switch, onboarding link) and note what broke in `docs/PILOT-LOG.md`.
- [ ] Decide GA4 for your own site (COPY-GAPS item 21) and who owns the Google Ads manager account (DELIVERABLES, "Still open").
- [ ] Verify PayFast's docs and test the sandbox (see "Billing" in the setup guide) before any client pays through it.
- [ ] Attorney: consent wording on the onboarding page, operator agreement, and the privacy-policy tool list (COPY-GAPS 19 to 23).
- [ ] Apply early for the long-lead approvals Phase 2 needs: Google Business Profile API access, Google OAuth verification (Search Console, GA4), and Meta only if direct posting is wanted.

## Housekeeping
- [ ] Delete the old preview branches on GitHub (https://github.com/samuelbaradhuwar-svg/KODA-3/branches): `preview/brand-polish`, `preview/compliance-1-wording`, `preview/compliance-2-forms`, `preview/compliance-3-policies`, `preview/ecommerce-custom-code`, `preview/free-audit`, `preview/hero-audit`, `preview/hero-pill-mobile`, `preview/legal-compliance`, `preview/trust-and-pricing`. Keep `claude/new-session-kcqrga`, which the site deploys from.
- [ ] Screen reader pass (VoiceOver or NVDA) on the whole site.
