# Site copy vs what Autopilot can really deliver (Phase 0)

Status: **list for the owner. Nothing in `src/` was changed.** I did not edit the legal pages or `src/legal-config.js`; items about them are flagged for the attorney review already on `TODO.md`.

Priority: **A** = fix before any paid client; **B** = fix before launching the monthly plans publicly; **C** = tidy.

## 1. Claims about people and hand work

| # | Where | Current copy | Gap | Suggested resolution | Pri |
|---|---|---|---|---|---|
| 1 | `content.js` COMPARE row "Who you talk to" | "The people who built your site" | Under Autopilot, much of the monthly work is drafted by an AI and approved by you. The statement is true only if a person is genuinely reachable | Say who you reach and that a person reviews work: "A KODA team member reviews everything we publish for you" (only if true in practice) | A |
| 2 | `Audit.jsx`, `Legal.jsx` (specialist audit) | "reviewed by a person", "a detailed audit by a specialist" | Fine for the free audit today. Becomes a promise on Autopilot reports too | Keep as is for the audit; do not copy the wording onto monthly deliverables unless a human reviews them | C |
| 3 | `STRAIGHT_TALK`, `Contact.jsx` | "People who reply", "We reply to every enquiry within one working day" | Needs a named owner and a way to catch enquiries. The contact form is `mailto:` only, so nothing is stored or tracked | Phase 1 intake inbox with an SLA timer; until then keep the promise only if you will honour it | A |
| 4 | Missing | No statement that AI helps produce work | Clients should be told, and the terms should say so | Add a plain sentence on the plans and in the written quote; attorney to confirm wording | A |

## 2. Plan line items that are vague or undefined

| # | Where | Current copy | Gap | Suggested resolution | Pri |
|---|---|---|---|---|---|
| 5 | `MONTHLY_PLANS` | "2 promotional campaigns", "4 marketing campaigns" | "Campaign" is not defined anywhere | Use the definition in `DELIVERABLES.md`, then show it on the plans | A |
| 6 | `MONTHLY_PLANS` | "Conversion optimisation" | Implies testing and results. Small sites rarely have enough traffic to test | Rename or describe as "Monthly conversion review and recommended changes" | B |
| 7 | `MONTHLY_PLANS` | "Advanced SEO strategy" | No output named | "A written quarterly SEO plan and monthly page fixes" (per spec) | B |
| 8 | `MONTHLY_PLANS` | "Detailed monthly reporting" vs "Monthly growth report" vs "Monthly performance report" | Three names, no contents | One named report per tier with a section list | B |
| 9 | `MONTHLY_PLANS` | "Google Business Profile management" | No counts, and GBP API access is not confirmed | State what is included (posts, review reply drafts, hours updates) once access is confirmed | A |
| 10 | `MONTHLY_PLANS` | "Website maintenance" | No change-request allowance, though the FAQ says "small changes for a flat monthly fee" | State a monthly number of small changes | A |
| 11 | `MONTHLY_PLANS` | "Competitor monitoring" | No number of competitors | State "up to 3 competitors" | C |
| 12 | `MONTHLY_PLANS` | "4 / 8 / 12 social media posts" | Totals or additions is ambiguous | Add "in total" or "additional" to the copy once decided | B |
| 13 | `MONTHLY_PLANS`, FAQ | "Website traffic and lead tracking" | Needs GA4 and events installed on the client site first | Add "set up once at the start" and say "tracked enquiries", not "leads" | B |
| 14 | `MONTHLY_PLANS`, Terms | "Posts" and unapproved drafts | The refund policy says an agreed item not delivered is delivered, credited or refunded. If a client never approves a draft, which is it? | Decide per Open decision 3 in `DELIVERABLES.md`; attorney to confirm; put in the written quote | A |

## 3. Promises that need a system behind them

| # | Where | Copy | Gap | Resolution | Pri |
|---|---|---|---|---|---|
| 15 | `PLANS` features, `WHY_US`, `INCLUDED`, FAQ | "Managed hosting with SSL, backups and monitoring" | Nothing in this repo monitors client sites. Verify what the host really provides | Phase 2 uptime and SSL job; until then confirm the claim is true for each site | A |
| 16 | `INCLUDED`, FAQ, COMPARE | "Tell us what to change and we take care of it, covered by our monthly plans" | No intake channel, ticket or tracking | Phase 2 change-request intake (email and WhatsApp to tasks) | B |
| 17 | `PRESENCE`, `Process` "Grow" | "We keep your website and online presence up to date" | Needs the scheduler and approval flow | Phase 1 and 2 | B |
| 18 | `TODO.md` | "Confirm every promise on the site is one you can keep" | Still open | Use this document as the checklist | A |

## 4. Legal pages and privacy (for the attorney; not edited)

| # | Where | Gap | Pri |
|---|---|---|---|
| 19 | Privacy policy, "Who we share it with" | Lists Vercel, Resend, Google PageSpeed, Anthropic (summary only, "not your name, email or website address"). Autopilot adds Supabase, PayFast, Composio, the social scheduler, Google APIs, Semrush, and sends client brand profiles and analytics to Anthropic. Policy must list them and the Anthropic sentence will no longer be accurate for monthly clients | A |
| 20 | Privacy policy, section 72 | Cross-border processing statement covers "these providers"; the list must be updated alongside item 19 | A |
| 21 | Privacy policy and cookie policy | "We do not use analytics, advertising or tracking tools on this website" and "KODA does not use tracking or advertising cookies". For client zero, putting GA4 on heykoda.co.za would make this false. Options: use only Search Console and PageSpeed for KODA itself (no change to the pages), or change the policies first, with attorney review | A |
| 22 | Privacy policy, "Monthly plans" | Says access is requested "through each platform's own sharing or manager permissions, rather than a password". Autopilot stores OAuth tokens. Wording should explain this and that tokens are encrypted | B |
| 23 | Privacy and terms, operator role | KODA acts as an operator for clients' customers' data. A written operator agreement is required and is not in the repo | A |
| 24 | Privacy policy, "Technical data" | Rate limit "not saved to a database". Autopilot adds a database; this sentence is about the free check only, so check it stays accurate | C |
| 25 | `TODO.md` legal items | Information Officer not registered; `LEGAL.reviewed` not set; business details not filled | A |
| 26 | Refund policy, advertising | "If you paid us an advertising budget that has not yet been spent, we will refund the unspent part." The design assumes the client pays Google directly and KODA never holds ad money. Confirm that, otherwise the system needs a trust-account style ledger | A |

## 5. Smaller points

| # | Where | Note | Pri |
|---|---|---|---|
| 27 | `Pricing.jsx` | "These are proposed starting prices" appears on the monthly plans. Fine for now; replace once the deliverables are fixed | C |
| 28 | `content.js` `COMPARE` last row | "From R3,499 once off" ignores monthly plans | C |
| 29 | `Pricing.jsx` | "cancel with 20 business days' written notice": billing and job generation must keep running through the notice period (refund policy says so). Phase 1 plan status must reflect this | B |
