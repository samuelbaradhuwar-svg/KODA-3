# KODA email authenticator: setup and use

> The name on screen is **Email authenticator**, to tell it apart from the separate Autopilot app (growth-command-center). The code, routes (`/command`, `/api/command`), tables (`cc_`) and this file keep the older name "command centre".

A private page for the owner only, at `/command`. Audit requests land in an inbox; later steps add the in-depth audit,
the editable findings, the client report and the send flow. This file grows with each step.

**Built so far:**
- Step 1: sign-in, the inbox, request detail (status, private notes, delete), saving each detailed audit request when it arrives.
- Step 2: **Run in-depth audit** (crawler and technical checks, below).
- Step 5: the send flow (draft, preview, test, send, log).
- Step 4: the client report (preview, private link, save as PDF).
- Step 3: search and conversion checks, the "About this business" form, the manual-review checklist and a findings editor (below).

## How it is protected
- Sign-in is an emailed link (Supabase). Only the address in `COMMAND_ADMIN_EMAIL` is accepted, and the **server checks
  it on every request** (`api/command`). Hiding the page is not the guard.
- The database tables have row level security on and no policies, so the browser can read nothing directly.
- `/command`, `/report/*` and `/api/command/*` send `X-Robots-Tag: noindex`, `robots.txt` disallows them, and they are not in `sitemap.xml`.
- The crawler (step 2) only opens public addresses, with size and time limits, and is rate limited.

## Where data lives, and why
Supabase (Postgres). It gives sign-in and a database in one place and works with row level security. The free plan is
enough to start. Free projects pause after about a week of no use; if the inbox stops loading, restore the project in
the Supabase dashboard (or move to the paid plan).

## One-time setup
1. **Database:** the three `cc_` tables live in the `growth-command-center` Supabase project, next to the Autopilot
   `ap_` tables (the free plan allows only 3 projects). The migration (`command-center/db/0001_cc_init.sql`, undo with
   `0001_cc_init.down.sql`) only adds `cc_` tables and touches nothing else. Both apps share that project's service
   key and its sign-in settings, so keep the key out of the browser and the repo. To move to a separate project later,
   run the same file there and change the four Supabase variables.
2. **Your login:** Supabase, Authentication, Users. Make sure `hello@heykoda.co.za` exists (Add user, tick auto-confirm).
   Sign-in never creates users, and the server only accepts that one address, so other users in the project (for
   example Autopilot's) cannot open the command centre. Supabase's built-in email sender is slow and limited to a few
   links an hour; that is enough for one person.
3. **Allow the sign-in link to come back to the site:** Authentication, URL Configuration. Add
   `https://www.heykoda.co.za/command` and `https://*.vercel.app/command` to Redirect URLs.
4. **Vercel environment variables** (Project, Settings, Environment Variables; tick **Production and Preview**), then redeploy:

| Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | Project URL | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | the **secret** key: either the old `service_role` key (long, starts `eyJ`) or the newer `sb_secret_…` key | Server only. Never the anon / publishable key (the server refuses it and says so). Never prefix with `VITE_`. Never paste it in chat or commit it. |
| `VITE_SUPABASE_URL` | Project URL | Browser sign-in |
| `VITE_SUPABASE_ANON_KEY` | `anon` or `publishable` public key | Browser sign-in (public by design). If Vercel says the name already exists, use `VITE_SUPABASE_PUBLISHABLE_KEY` instead; the page accepts either. |
| `COMMAND_ADMIN_EMAIL` | `hello@heykoda.co.za` | Optional; this is the default |
| `COMMAND_FROM` | `KODA <hello@heykoda.co.za>` | Optional; the sender shown on emails to clients |
| `COMMAND_RETENTION_DAYS` | `180` | Optional; days before a request deletes itself |
| `PAGESPEED_API_KEY` | free Google key | Optional but recommended: without it Google's shared speed quota often runs out |

Setup gotchas we hit:
- Check the project name at the top left of Vercel says **koda-3**. The Autopilot project (growth-command-center) has similar variables, and "already exists" errors usually mean you are in that one.
- Tick **Production and Preview** for every variable, including the secret service key; a preview build cannot see a Production-only variable.
- Variables only reach a build that starts after they are saved, so redeploy after adding them.

If you ever rotate the Supabase secret key, update `SUPABASE_SERVICE_ROLE_KEY` in koda-3 (and Autopilot's own project, which has its own copy) and redeploy. The page tells you if the saved key is the public one.

Already set and reused: `RESEND_API_KEY` (Production and Preview), `AUDIT_FROM`, `AUDIT_NOTIFY_TO`, `AUDIT_MODE` (Production only). Requests submitted on a preview address are not emailed to you, because the audit variables are Production only; that is why the preview inbox is filled by hand during testing.

## The in-depth audit (step 2)
**Run in-depth audit** on a request does, in order: crawl, Google speed on a phone, Google speed on a computer, then work out findings.
- **Crawl:** the home page plus up to 9 key pages (services, about, contact, blog, pricing, areas, gallery, FAQ, shop; picked from the home page links and the sitemap). Only public addresses are opened (private networks, localhost and similar are refused, including after redirects), each request has a size and time limit, three pages are read at a time, and the whole crawl has a 45 second budget. If time runs out the page says what was skipped. At most 8 crawls an hour, and one at a time per audit.
- **Technical checks:** secure connection, http to https and www redirects, redirect chains, 404 behaviour, error pages, noindex, robots.txt, sitemap, canonical tags, structured data, phone viewport setting, insecure items on secure pages, server response time, security headers, broken links (up to 40 checked, social sites that block bots are not called broken), image sizes (up to 14 checked), image descriptions and sizes, plus Google's Core Web Vitals, accessibility and best-practice results for phone and computer.
- **Each finding** has a severity, what was seen and where, why it matters, the fix, the KODA service that does it, and a group (fix first, next, later). The service, plan, price and timeline are read from `src/catalog.js` (the same data as the website's pricing). Which service answers which kind of finding is in `api/_cc/catalog.js`; please review that list.
- Only structured facts and short evidence are stored. Raw page HTML is never stored.
- **Not judged automatically:** the rendered phone layout (only the phone setting is checked), Google Business Profile, design and copy. These get a manual-review checklist in the next step.
- Re-running replaces the automatic findings and keeps any you have edited or added.

## Search and conversion checks, and editing (step 3)
- **About this business:** enter the trade, town, areas served, phone, address and business name. A crawler cannot know these, so the keyword and local checks only run once you have entered them, and the audit says so when they have not run. Press **Save and check again** to re-run just the analysis (no new crawl).
- **Search checks:** titles (missing, length, duplicates), descriptions, headings, thin pages, missing key pages (services, about, contact, blog, FAQ), whether the trade and town appear in the home page title, heading, description and text, phone numbers that disagree between pages, and whether your phone, address, business name and areas appear on the site.
- **Conversion checks:** a clear headline, calls to action, ways to get in touch (tap-to-call, WhatsApp, form, email, contact page), booking, and trust signals (reviews, examples of work, guarantees and credentials). It reads the wording and structure of the pages; whether the offer is *good* is on the manual list.
- **Trust signals are found on the pages read, not verified.** If a page was crawled before step 3, run the audit again so these signals exist; otherwise those checks stay silent rather than guess.
- **Manual review (never guessed):** Google Business Profile (exists, complete, details match, reviews), where they show on Google, competitors, design first impression, the real phone layout, whether the offer is clear in 5 seconds, writing quality, photos and brand, social profiles. Each item starts as "Manual review needed". Set it to Looks fine, Problem or Not relevant, add notes, and use **Add as a finding** for any problem.
- **Findings editor:** change the title, severity, group (fix first, next, later), the KODA service, and the three texts (what we saw, why it matters, the fix) on any finding. Untick **Include in the client report** to hide one (it moves to "Hidden from the report"). **Add a finding** writes your own, and your own findings can be deleted. Press **Save findings**; the page warns you when something is unsaved.
- **Re-running** keeps anything you edited, hid or added. Automatic findings you have not touched are refreshed.
- The service dropdown only lists services from `src/catalog.js`; prices and timelines come from there too.

## The client report (step 4)
At the bottom of an audit, **Client report**:
- **Contents:** summary, at a glance, your three biggest wins, what is already working, every included finding (fix first, next, later) with evidence, why it matters, the fix and the KODA service with its prices, the manual review (with anything "not yet reviewed" shown honestly), a proposed plan with a recommendation, what could not be checked, and a short honest note that results are not guaranteed.
- **Edit before it goes anywhere:** the summary and plan text start as defaults written from the findings (counts, scores and strengths come from the audit, never invented); change any of it, or press "Use the automatic text again". Pick up to three wins (or leave it on automatic: fix first, then severity). Override the recommended one-off plan (Starter, Business, Custom, none) and monthly plan (Presence, Growth, Performance, none). The automatic suggestion: booking or online store findings suggest Custom; two or more rebuild findings (or one high one) suggest Business; SEO, maintenance or Google Business Profile findings suggest Presence, or Growth when there are four or more SEO findings.
- **Prices, timelines and plan features come from `src/catalog.js`**, the same data as the website. The report says prices are the ones published on the website and that the timeline is agreed first.
- **Manual-review notes appear in the report**, so write them for the client. Your private notes on the request page never do.
- **Preview report** opens the saved report in a new tab (sign-in required) with a banner saying nothing has been sent. Save first.
- **Private link:** **Create private link** (valid for 7, 30 or 90 days) makes a 43-character random link at `/report/<token>`. It needs no sign-in, so anyone with it can read the report until it expires or you press **Withdraw link**. Creating a new link replaces the old one. Reads are rate limited, the page is noindex, and the report contains nothing but the report (no email, phone, your notes or raw crawl data).
- **Save as PDF** uses the browser's print (the report is laid out for A4). A server-made PDF is not included.
- The link can also be emailed from here (next section).

## Emailing the report (step 5)
At the bottom of an audit, **Email to the client**:
- **Draft:** a plain-English email is written from the report (greeting, the private link as a button, the counts and the three wins, the honest "we cannot promise rankings or sales" line, when the link expires, "reply to this email"). Edit the subject and text freely. The text is plain: a line that is only a link becomes a button, and lines starting with "- " become bullets. Create the private link first, then use **Reset to the default text** so the link is filled in.
- **Always from hello@heykoda.co.za, reply-to hello@heykoda.co.za** (through Resend, using `RESEND_API_KEY`; the sender can be changed with `COMMAND_FROM`). The recipient is **always the address on the request**; the server refuses anything else. The logo is attached to the email as an inline image, because the name must always appear in the logo lettering.
- **Preview first:** **Send a test** and **Send to the client…** stay locked until you press **Preview email** for the current text; changing a letter locks them again. The preview is the same HTML that is sent (the server rebuilds it from your text).
- **Test:** **Send a test to hello@…** sends the same email to you only, with "[TEST]" in the subject. It changes nothing on the request.
- **Send:** **Send to the client…** opens a confirmation ("Send this email to … now? It cannot be unsent."). Only **Yes, send now** sends. You can tick **Send me a copy** (BCC). The request becomes **Sent**.
- **No double sends:** every click carries a one-time reference (also passed to Resend as an idempotency key), so a double click cannot send twice. A second real send of the same report needs you to tick "send it again".
- **Preview addresses cannot email clients.** On a Vercel preview URL (`VERCEL_ENV=preview`) real client emails are blocked, because a client may not be able to open a preview link (and the link in the email would point at it). Tests to yourself work. To override on purpose, set `COMMAND_ALLOW_PREVIEW_CLIENT_SEND=1`.
- **Log:** every attempt is stored in `cc_sends` (date, recipient, subject, the exact HTML, Resend's id, test or client, and the reason if it failed). The request page shows it under **Sent emails** with a **View** button. Failed sends are logged too, and can be retried.
- If `RESEND_API_KEY` is missing in an environment, the screen says so and sending is disabled. It is set for Production and Preview. On a preview address you can send tests to yourself; real client emails stay blocked there.
- The audit's original "request" email still arrives as before and is unrelated to this.

## Using it
- Open `/command`, enter your address, click the link in the email.
- Each detailed audit request appears in the inbox (the email to you still arrives as before).
- **Reply by email** opens a reply to the visitor. Set the status as you go: new, replied, audit drafted, sent, won, lost.
- **Run in-depth audit** takes up to about two minutes; leave the page open.
- **Delete this request** removes it, its audit and its send log for good.

## POPIA
Only what the visitor submitted is stored (site address, email, business, phone, note and the automatic findings they
saw). Each request deletes itself after `COMMAND_RETENTION_DAYS` (default 180), whenever the inbox is opened after that
date, and can be deleted by hand at any time. Legal pages are still drafts pending attorney review; add the retention
period to the privacy notice when it is reviewed.

## Checks
`npm test` runs the self-tests (`scripts/audit-selftest.mjs`, `scripts/command-selftest.mjs`): sign-in rules, the API,
trimming, address safety and the database migration (in PGlite).

## Known limits
- Anyone can submit a request through the public form; it is limited to 5 an hour per visitor and has a hidden bot trap,
  but a determined spammer could still fill the inbox. Delete is one click.
- The automatic findings attached to a request come from the visitor's browser, so they are treated as unverified.
