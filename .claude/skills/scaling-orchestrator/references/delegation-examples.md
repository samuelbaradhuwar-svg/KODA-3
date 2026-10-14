# Delegation examples

How the tiers play out on real KODA requests.

| Request | Tier | Plan |
|---|---|---|
| "Change the pricing for the Growth plan to R4 500" | 0 | Edit `PLANS` in `src/App.jsx`, build, done |
| "The FAQ items don't close on mobile" | 0-1 | Fix yourself, build, run `npm run test:e2e`. Reviewer not needed |
| "Add a testimonials carousel" | 1 | Build it yourself. Spawn `qa-playwright-tester` to add a regression test and run the suite |
| "Make the contact form actually send email" | 1 | Build it yourself (it touches config and possibly a dependency). Spawn `code-quality-security-reviewer` (spam, validation, secrets) and `qa-playwright-tester` |
| "Add a /website-design-umhlanga landing page" | 2 | Wave 1: `seo-specialist` writes the keyword and metadata plan in `docs/seo/`. You build the page in `App.jsx` (shared hotspot, so not delegated in parallel). Wave 2: `seo-specialist` updates sitemap and `index.html`; `qa-playwright-tester` adds the route and runs the suite |
| "Replace the portfolio placeholders with three real projects, here are screenshots" | 2 | `visual-image-specialist` optimises the screenshots into `src/assets/` while `design-specialist` analyses them with `image-to-code` for the card layout. Then one `frontend-developer` (or you) updates the portfolio section. QA runs the suite |
| "Build a website for a new client: a Durban physiotherapy practice, 6 sections" | 3 | Wave 1 parallel: `design-specialist` (direction via `design-taste-frontend` draw or an `awesome-design` system, section specs), `seo-specialist` (local keyword plan, metadata). You lock decisions and scaffold the project with one file per section. Wave 2 parallel: 2-3 `frontend-developer` instances on disjoint component files, `visual-image-specialist` on assets. You integrate. Wave 3 parallel: `qa-playwright-tester`, `code-quality-security-reviewer`. Fix loop, final gate |
| "Redesign the KODA site to look more premium" | 3, but ask first | The KODA design is approved as final. Confirm scope with the user before reopening locked decisions |
| "Pre-launch audit of the site" | 2 | Parallel: `seo-specialist` (audit only), `code-quality-security-reviewer`, `qa-playwright-tester`. No code changes until you have read the three reports and agreed fixes with the user |
| "What does this CSS class do?" | none | Answer it |

Scaling the frontend team: count the disjoint file groups in wave 2. One `frontend-developer` per
group, at most 3 at once (the concurrency cap is 4 and you want a slot for assets or SEO). If there is
only one group, there is one developer, or none if you can do it faster yourself.
