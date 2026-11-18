import React from "react";
import { TOWN_SHARED_FAQS, townPath, nearTowns } from "../towns.js";
import { trailFor } from "../trail.js";
import TownLinks from "../components/TownLinks.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { Button, Eyebrow, Headline, Reveal, Koda } from "../components/ui.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { scrollToId } from "../lib/utils.js";

// The page is kept short on purpose: what makes a town page worth having is the town itself (why, areas, nearby,
// its questions), which comes from src/towns.js. The shared parts (what we do, how it works, the price) live on the
// Durban page, the pricing page and the home page, and this page links to them instead of repeating them.

// In a draft, anything still in [square brackets] is highlighted so it is easy to see what is left to fill in.
function Fill({ text }) {
  return String(text)
    .split(/(\[[^\]]*\])/)
    .map((part, i) => (/^\[[^\]]*\]$/.test(part) ? <mark key={i} className="rounded bg-accent/60 px-1 text-ink">{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>));
}

export default function TownPage({ town }) {
  const draft = !town.live;
  const faqs = [...town.faqs, ...TOWN_SHARED_FAQS];
  const near = nearTowns(town);
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Breadcrumb trail={trailFor(townPath(town))} />
            {draft && (
              <p role="note" className="mb-8 max-w-[62ch] rounded-2xl border border-ink/20 bg-accent px-5 py-4 text-[14px] leading-[1.55] text-ink">
                <b>Draft, not published.</b> This page shows only in previews. Fill in the highlighted [bracketed] parts in <code>src/towns.js</code> with real facts, then set <code>live: true</code>.
              </p>
            )}
            <Reveal>
              <Eyebrow>{town.name}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                Website design for <em>{town.name}</em> businesses.
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                <Koda /> builds websites for local businesses and start-ups, and sets them up to be found on Google and in AI tools like ChatGPT. See all our{" "}
                <a className="underline underline-offset-4" href="/website-design-durban">website design in Durban</a>.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button onClick={() => scrollToId("contact")}>Get my free mock-up</Button>
              <a href="/#audit" className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-ink/60">
                <span className="border-b border-ink/40 pb-0.5">Get a free website audit</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">Why {town.name}</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            {town.why.map((w) => (
              <p key={w} className="t-body mb-5 text-base"><Fill text={w} /></p>
            ))}
            <h3 className="xwide mt-8 text-[clamp(1.05rem,2.3vw,1.3rem)] leading-[1.1] tracking-[-0.02em]">How we work with {town.name} businesses</h3>
            <p className="t-body mt-3 text-base"><Fill text={town.serve} /></p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Areas we serve</Eyebrow>
            <Headline className="h-section mt-5 max-w-[16ch]">{`Areas we cover in ${town.name}.`}</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <ul className="flex flex-wrap gap-2.5">
              {town.areas.map((a) => (
                <li key={a} className="rounded-full border border-ink/15 px-4 py-2 text-[14px] text-ink/85"><Fill text={a} /></li>
              ))}
            </ul>
            {near.length > 0 && (
              <p className="t-body mt-8 text-base">
                Nearby areas with their own page:{" "}
                {near.map((t, i) => (
                  <React.Fragment key={t.slug}>
                    {i > 0 && (i === near.length - 1 ? " and " : ", ")}
                    <a className="underline underline-offset-4" href={townPath(t)}>{t.name}</a>
                  </React.Fragment>
                ))}
                .
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {town.work && (
        <section className="sec bg-paper2">
          <div className="wrap grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <Headline className="h-section">Our work in {town.name}</Headline>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
              <h3 className="font-display text-[1.3rem] leading-tight"><Fill text={town.work.name} /></h3>
              <p className="t-body mt-3 text-base"><Fill text={town.work.text} /></p>
              <p className="t-body mt-5 text-base">
                See more on our <a className="underline underline-offset-4" href={town.work.href || "/our-work"}>work page</a>.
              </p>
            </Reveal>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <Reveal className="grid items-center gap-6 rounded-[2rem] bg-accent px-6 py-10 text-ink sm:px-12 sm:py-14 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70">Ready when you are</p>
              <h2 className="xwide mt-4 text-[clamp(1.4rem,2.7vw,2.4rem)] leading-[1.06] tracking-[-0.02em]">See your homepage before you pay.</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-ink/75">
                Ask for a free homepage mock-up. See our <a className="underline underline-offset-4" href="/pricing">pricing</a> and our <a className="underline underline-offset-4" href="/our-work">work</a>.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button onClick={() => scrollToId("contact")}>Get my free mock-up</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Faq title={`Questions from ${town.name} businesses`} items={faqs} />
      <TownLinks hub exclude={town.slug} />
      <Contact />
    </main>
  );
}
