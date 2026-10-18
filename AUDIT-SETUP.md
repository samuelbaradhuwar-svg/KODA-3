# Free website check: setup

The check lives in `api/audit.js` (a Vercel serverless function) and `src/components/Audit.jsx` (the section on the
home page, just above Contact, reachable from the menu as "Free audit").

## What it does
1. A visitor enters their website address and email and ticks the consent box.
2. The function opens the home page (public addresses only) and checks: HTTPS, page title, search description, main
   heading, phone setup, language, image descriptions, business structured data, canonical address, sharing tags,
   contact links, server response time, robots.txt and sitemap.xml.
3. It asks Google PageSpeed Insights for mobile speed, accessibility, SEO and best-practice scores.
4. It builds a plain-English report with the top three fixes and emails it.

Google Business Profile, design and copy are **not** judged automatically. The report says so, and you follow up by hand.

## Settings (Vercel, Project, Settings, Environment Variables)
| Name | Needed | What it does |
|---|---|---|
| `RESEND_API_KEY` | yes | Sends the emails. Create a free account at resend.com and copy an API key. |
| `AUDIT_MODE` | no | `review` (default): the report is emailed to you only; the visitor is told it is on its way. `live`: the visitor sees results on screen and gets the email, and you are copied. |
| `AUDIT_NOTIFY_TO` | no | Where reviews and copies go. Default `info@heykoda.co.za`. |
| `AUDIT_FROM` | no | The sender. Until your domain is verified in Resend, leave it unset (Resend's test sender can only email your own Resend address, which is fine for `review` mode). To email visitors, verify heykoda.co.za in Resend and set e.g. `KODA Audits <audit@heykoda.co.za>`. |
| `PAGESPEED_API_KEY` | no | Free key from Google Cloud (PageSpeed Insights API). Avoids Google's shared rate limit. |

Start in `review` mode. Once you are happy with what the reports say, switch `AUDIT_MODE` to `live`.

## Protections built in
- Only public web addresses are opened (private networks, localhost and similar are refused, including after redirects).
- Pages are size-limited and time-limited.
- A hidden field catches simple bots, and each visitor is limited to 5 checks an hour (best effort on serverless).
- The consent box is required (POPIA). Add a link to your privacy notice next to it when you have one.

## Known limits
- The rate limit is per server instance. For heavier abuse protection add Cloudflare Turnstile or similar.
- Only the home page is checked.
- Pages that need JavaScript to show their content may show fewer details than a visitor sees.

## Testing without keys
`node scripts/audit-selftest.mjs` runs the checks against a local test page and the safety rules. It does not call Google or Resend.
