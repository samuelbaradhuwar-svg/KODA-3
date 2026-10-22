# KODA Autopilot: monthly plan deliverables (Phase 0 spec)

Status: **DRAFT for owner review. No code exists yet.** Anything marked *(proposed)* is a number or definition I chose so it can be measured; the site does not say it today. Confirm or change each one before Phase 1.

Source of truth for what is promised today: `MONTHLY_PLANS` in `src/content.js`, plus the monthly-plan sections of the terms (`src/pages/Legal.jsx`) and refund policy.

## How to read this

**Automation level**
| Level | Meaning |
|---|---|
| **auto** | The system does it and logs it. No human step. Only for read-only or safety-increasing actions. |
| **auto-with-approval** | The agent drafts or prepares it; a human approves the exact payload; then the system executes. Default for anything public or client-facing. |
| **human** | A person does it. The system may prepare notes. |

Per client and per task type the mode can later be switched from approve to auto. Default is approve. Reports start as auto-with-approval and move to auto only after the pilot gate (see the end).

**Rules that apply to every item**
1. Every action writes one row to the append-only audit log (who/what/when, payload hash, result).
2. A per-client kill switch stops all queued and running work for that client.
3. Anything that spends money has a hard monthly cap enforced in code, before the API call.
4. Nothing we write or report may claim a ranking, a number of leads, traffic, sales or any outcome we do not measure. Measured numbers are labelled with their source ("Google Search Console reported ...").
5. We work in accounts that belong to the client, with the minimum access (platform sharing or manager access where the platform allows it).
6. Allowances are fixed per month, not unlimited. Unused allowance does not carry over unless the written quote says so.

## Allowance summary

Plans stack ("Everything included in ..."). I read the post and campaign counts as **totals per tier, not additions** (Presence 4, Growth 8, Performance 12 posts). Confirm.

| Item | Presence R1,499 | Growth R2,999 | Performance R4,999 |
|---|---|---|---|
| Social posts drafted and offered | 4 | 8 | 12 |
| Promotional campaigns | none | 2 | 4 |
| Google Business Profile posts *(proposed)* | 2 | 4 | 4 |
| Website change requests *(proposed)* | 2 | 4 | 6 |
| SEO page fixes shipped *(proposed)* | up to 3 | up to 6 | up to 8 |
| Report | Monthly performance | Monthly growth | Detailed monthly |
| Competitors monitored *(proposed)* | none | none | up to 3 |

## Presence (4 line items plus report)

| Line item | Concrete monthly output | Done when (measurable) | Inputs | Level | Tools | Main failure mode |
|---|---|---|---|---|---|---|
| **Website maintenance** | Uptime and SSL-expiry checks run continuously; one monthly dependency and security update pull request per client site repo; backups confirmed with the host; up to 2 *(proposed)* client change requests done | Uptime % and SSL days-left recorded; update PR opened or "nothing to update" logged; each change request closed with a preview link the client approved | Client site repo access, host access, change-request email or WhatsApp | Checks: **auto**. Update PRs and change requests: **auto-with-approval** (never auto-merge by default) | Uptime pinger, GitHub, Vercel/host API, Gmail intake | Bad update breaks the site. Mitigation: preview deploy, human merge, rollback to previous deploy |
| **Basic SEO optimisation** | One re-run of the page audit (reuse `api/audit.js` checks); up to 3 *(proposed)* on-page fixes (titles, descriptions, alt text, headings, schema, sitemap) shipped as a PR; Search Console error triage | Audit before/after saved; fixes listed in the report's "what we did" ledger | Site repo, Search Console access | Audit: **auto**. Fixes: **auto-with-approval** | `audit.js` checks, PageSpeed API, Search Console API | Over-optimised or wrong titles. Mitigation: human approval of diff; claims linter |
| **Google Business Profile management** | Profile completeness check; **2 GBP posts** *(proposed)*; a drafted reply for every new review; hours and holiday updates on request | Checklist score saved; posts published and logged; every new review has a draft within 2 business days of detection | Business Profile access (manager invite or API authorisation) | Check: **auto**. Posts, replies, hours: **auto-with-approval** | Google Business Profile API (access must be granted by Google; verify before promising), otherwise a human copy-paste checklist | API access not approved, so these become **human**. Public replies in the client's name need strong approval discipline |
| **4 social media posts monthly** | 4 post drafts (text plus image brief or generated asset) from the brand profile | 4 drafts offered to the client by day 5 of the month; each approved post scheduled and published; ledger shows used/4 | Brand-voice profile, client offers and photos | Drafting: **auto**. Publishing: **auto-with-approval** | Claude for drafts, scheduler via Composio, brand profile | Off-brand or false claim. Mitigation: banned-claims list, linter, approval. Unapproved drafts lapse after 5 business days (see Open decisions) |
| **Monthly performance report** | One PDF and a short email, built only from measured data | Delivered by the 5th business day; every figure has a named source; "what we did" ledger matches the audit log | PageSpeed, uptime log, Search Console, GBP data if available, social publish log | **auto-with-approval** until the pilot gate, then **auto** | Reuse `buildReport`, `buildPdf`, `sendEmail`, Claude summary over measured facts only | Wrong or invented number. Mitigation: summary sees only structured facts, as `aiFacts` does today |

**Presence report sections:** what we did (ledger); site health (PageSpeed scores, uptime %, SSL); search visibility as reported by Search Console (clicks, impressions, average position, labelled as reported, no promises); Google Business Profile activity if the API is available; social posts published; what we plan next month.

## Growth (adds to Presence)

| Line item | Concrete monthly output | Done when | Inputs | Level | Tools | Failure mode |
|---|---|---|---|---|---|---|
| **Ongoing SEO management** | Everything in basic SEO, raised to up to 6 *(proposed)* page fixes; monthly Search Console query and page review; one content or page recommendation | Fixes shipped or declined with reason; recommendation in the report | Search Console, site repo | **auto-with-approval** | Search Console API, Semrush (optional) | Chasing queries with no real demand. Mitigation: recommendation must cite a measured query |
| **8 social media posts monthly** | 8 drafts (total, including the 4 above) | As for 4 posts; ledger used/8 | Brand profile, content calendar | Drafting **auto**; publishing **auto-with-approval** | as above | as above |
| **2 promotional campaigns monthly** | **A promotional campaign (proposed definition):** one offer or message with a one-paragraph brief, 1 social post, 1 GBP post, 1 email or WhatsApp broadcast blurb, 1 landing-page section of copy, and a UTM-tagged link. Campaign assets do not use the post allowance. Email or WhatsApp sends only to people the client may lawfully contact (POPIA) | 2 campaign packs approved and run per month; each has UTM links and a result line in the report taken from measured clicks and tracked events | Client offers and dates, brand profile, contact list rules | Pack drafting **auto**; publishing and any broadcast **auto-with-approval** | Claude, scheduler, GA4 UTMs | Sending marketing to people without consent. Mitigation: no sends without the client confirming consent for that list |
| **Content strategy** | Quarterly strategy doc (audience, themes, 3 to 5 topic clusters from Search Console data); monthly content calendar covering the posts and campaigns | Calendar for next month approved by day 25 of this month | Brand profile, Search Console, client calendar | Doc: **auto-with-approval**; calendar: **auto** (it is an internal plan) | Claude, Semrush | Generic strategy. Mitigation: must reference client offers and measured queries |
| **Website traffic and lead tracking** | GA4 and defined events installed once at onboarding (form submit, WhatsApp click, call click, email click); monthly numbers reported | Events verified firing; monthly counts in report labelled "tracked events", not "customers" | Site repo, GA4 access, client consent notice on their site | Setup: **auto-with-approval** (a PR to the client site). Counting: **auto** | GA4 Data API | Tracking breaks silently. Mitigation: daily check that events fired in the last 7 days; alert on zero |
| **Monthly growth report** | Presence report plus traffic by source, tracked events, campaign results, next month's content calendar | As the Presence report | as above | as above | as above | as above |

## Performance (adds to Growth)

| Line item | Concrete monthly output | Done when | Inputs | Level | Tools | Failure mode |
|---|---|---|---|---|---|---|
| **12 social media posts monthly** | 12 drafts total | as above | as above | as above | as above | as above |
| **4 marketing campaigns monthly** | 4 campaign packs (same definition as above) | 4 packs approved and run | as above | as above | as above | as above |
| **Advanced SEO strategy** | Quarterly written strategy (keyword and page plan from Search Console plus Semrush, internal-link plan, schema plan, local-SEO plan); monthly execution of up to 8 *(proposed)* page fixes | Strategy approved; fixes shipped and listed; progress shown as measured Search Console data | Search Console, Semrush, site repo | **auto-with-approval** | Search Console API, Semrush API | Strategy without execution capacity. Mitigation: monthly fix cap |
| **Conversion optimisation** | Monthly review of the top landing pages against tracked events; up to 3 *(proposed)* recommended changes, each with the evidence and an effort note; implemented as pull requests after client approval. **No A/B-test or uplift claims** | Review in the report; each recommendation shipped, declined or parked | GA4 events, page audit, site repo | **auto-with-approval** | GA4, `audit.js`, GitHub | Low traffic makes conclusions weak. Mitigation: report says so plainly |
| **Google Ads campaign management** | Daily budget and pacing check; weekly review of search terms, negative keywords, ad copy; one monthly ad refresh; ads section in report. **Ad spend is paid by the client to Google and is quoted separately** | Spend never exceeds the written monthly cap; every change was approved or inside pre-approved bounds; report shows spend vs cap and Google-reported clicks and conversions | Google Ads account (client-owned, linked to a KODA manager account), written monthly cap, tracked conversion events | Creating or changing campaigns, budgets, ad copy: **auto-with-approval**. **Pausing** on an anomaly: **auto** (it only reduces spend) | Google Ads API (developer token needed; verify current process) | Overspend or wasted spend. Mitigation: code-enforced cap, daily check, auto-pause, kill switch |
| **Competitor monitoring** | Up to 3 *(proposed)* named competitors agreed with the client; monthly digest of measured changes (visibility, keywords gained or lost, new pages, new backlinks) | Digest in the report with data source and date; no claims about why a change happened | Competitor domains | Pulls: **auto**; digest: **auto-with-approval** | Semrush API | Misreading third-party estimates. Mitigation: label as estimates |
| **Detailed monthly reporting** | Growth report plus: ads (spend vs cap, clicks, conversions as Google reports them, cost per tracked event), competitor digest, SEO strategy progress, conversion recommendations and their status | As the Presence report, plus every figure has source and date | all above | **auto-with-approval**, then **auto** after the pilot gate | as above | as above |

## Things that are always human
- Onboarding call, brand-voice interview, agreeing the written quote and the ad cap.
- Replying to a client's message that is not a simple change request.
- Anything involving a complaint, a legal question, a refund, or a client's customer's personal information request.
- Final decision to switch any task type from approve to auto.

## Gate before any paid client
No paid client until: the pilot log (`docs/PILOT-LOG.md`) has no unresolved wrong-publish or data-safety issue; the legal items in `TODO.md` are done (Information Officer registered, attorney review, operator terms); and the copy gaps in `docs/COPY-GAPS.md` are fixed or consciously accepted.

## Open decisions for the owner
1. Are post and campaign counts **totals per tier** (my reading) or additions?
2. Approve the *(proposed)* numbers: GBP posts, change requests, SEO fixes, competitors.
3. **Unapproved drafts:** my proposal is that a draft delivered for approval counts as delivered, and lapses after 5 business days with no reply. The refund policy says an agreed item "not delivered" is delivered, credited or refunded, so an attorney should confirm this wording before it goes into a quote.
4. Do campaign assets use the post allowance (I say no)?
5. Who owns the Ads manager account and the cap process (client pays Google directly, in my design)?
6. Is GA4 acceptable for your **own** site as client zero? The privacy and cookie pages currently say KODA uses no analytics or tracking. See `docs/COPY-GAPS.md`.
