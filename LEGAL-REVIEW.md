# Legal and compliance review (draft, 19 October 2026)

This is a technical and plain-English review, not legal advice. The four policies are drafts written for South Africa
(POPIA, CPA, ECTA). Have an attorney review them before they are treated as final.

## Must do before this goes live

1. **Fill in the business details** in `src/legal-config.js` (`BUSINESS`): registered name, type of business, a physical
   address, Information Officer. Run `npm run legal:check` to see what is missing. These are required for an online
   business (ECTA section 43) and for the privacy policy (POPIA). Nothing was guessed.
2. **Attorney review**, then set `LEGAL.reviewed = true`. Until then the legal pages show a "Draft" notice.
3. **Register your Information Officer** with the Information Regulator (online, free). For a sole proprietor this is
   the owner. NOT DONE YET. Check the current requirement on inforegulator.org.za, then set
   `LEGAL.informationOfficerRegistered = true` in `src/legal-config.js`.
4. **Confirm VAT**: prices say "R2,499" with no mention of VAT. If you are VAT registered, advertised prices must
   include VAT. If not, you may say so in quotes.
5. **Confirm the promises on the site are true**: the free homepage mock-up, the detailed audit "by hand" from a
   specialist, "managed hosting with SSL, backups and monitoring" on every plan, "support after launch", and the
   five to seven working day timeline. Remove any you cannot keep.
6. **Client permission**: you show the Blooming Bilingual and Trynetix sites (screenshots, names). Get written
   permission, and confirm you own or are licensed for everything visible in those screenshots.
7. **Confirm the refund policy suits you.** It follows the Consumer Protection Act (fair refund for work not done,
   fix or refund for defective work, 20 business days' notice for monthly services). Change it if you want different
   terms, as long as they are not worse for the customer than the law allows.

## What was checked

| Area | Finding | Action |
| --- | --- | --- |
| Cookies | The site sets no cookies and no local or session storage (tested in a browser). | No cookie banner needed. Cookie policy says so. |
| Analytics and trackers | None: no Google Analytics, Meta pixel or similar. | Policy states this. If you add any later, add consent first. |
| Third-party embeds | The Google Maps iframe loaded from Google as soon as the page opened. | Changed to click to load. Before the click, nothing is sent to Google. |
| Fonts | Self-hosted (Geist, Archivo, SIL Open Font License). Nothing loads from Google Fonts. | None. |
| Forms | Contact form: name, email, optional phone, business, message; no consent line. Audit form had consent. | Added a required consent tick and privacy link to the contact form; privacy link added to the audit consent; email footer says why they received it. |
| Data collected | Only what each form needs. Free check data is not stored in a database. | Documented in the privacy policy. |
| Processors | Vercel (hosting), Resend (email), Google PageSpeed (website address only), Anthropic (summary; receives findings only, no name, email or address). All process abroad. | Named in the privacy policy with the cross-border (POPIA s72) statement. Check each provider's data terms. |
| Reviews | Placeholder testimonials and "4.9/5 from 120+ businesses" removed. | Section is hidden until real quotes are added. |
| Claims | "Lightning fast", "never leave", outcome promises ("more clients, income, revenue"), the struck-through "R3,499" price, "shows up on Google". | Reworded or removed; added "we cannot promise rankings or sales". Re-add a "was" price only if it was genuinely charged before. |
| Business details | None on the site. | Footer and legal pages show them once filled in. |
| Accessibility | Automated scan (axe, WCAG 2.2 AA) on all pages, phone and desktop: no violations after fixes. Fixed: low-contrast "Keep scrolling" text, link names that did not contain their visible text, ambiguous "Get started" buttons, new-tab links now announced. Keyboard: all form fields reachable and visible focus; errors announced and focus moves to the first error; map button works from keyboard. | Automated tools find only part of the issues. Do a screen reader pass (NVDA or VoiceOver) before relying on this. |
| Contrast | Axe cannot measure text over the moving hero background. | The hero text sits on a frosted panel; check it by eye on your devices. |
| Alt text | Project screenshots have descriptive alt text; the logo is decorative next to the "KODA" text. | None. |
| Image and code licences | Fonts: SIL OFL. Icons (Phosphor) and smooth scroll (Lenis): MIT. Own artwork: logo, og-image. | Confirm where the hero shader code came from and that its licence allows use. Confirm the og-image is wholly your own. |
| Email delivery | Emails currently use Resend's test sender. | Verify heykoda.co.za in Resend (SPF/DKIM) before real customers use the audit. |

## Other risks to be aware of

- **Direct marketing (POPIA s69):** do not add audit or enquiry contacts to a newsletter or send promotions without
  their opt-in. The audit consent covers sending the report and following up about it, nothing more.
- **PAIA manual:** private businesses may need one, with exemptions for some small businesses. Ask your attorney.
- **EU/UK visitors:** the policies are written for South Africa. If you start targeting EU/UK customers, GDPR needs a
  separate look.
- **AI-written summary:** the report says it is an automatic check. Keep it that way; do not present it as a person's
  review.
- **Competitor comparison:** the "DIY builder vs cheapest quote" section is generic and hedged. Do not add named
  competitors or prices without evidence.
- **WhatsApp:** the number is not set. When you add it, mention WhatsApp in the privacy policy.
