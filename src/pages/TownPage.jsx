import React from "react";
import { PLANS, BUSINESS } from "../content.js";
import { TOWN_SHARED_FAQS, routedTowns, townPath } from "../towns.js";
import { Button, Eyebrow, Headline, Reveal, Koda } from "../components/ui.jsx";
import FreeMockup from "../components/FreeMockup.jsx";
import Audit from "../components/Audit.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { PHONE, scrollToId } from "../lib/utils.js";

// What we do and how it works are the same on every town page. Everything about the town itself comes from src/towns.js.
const WHAT = [
  { title: "Website development", desc: "Fast, clear websites that work on a phone, with booking or an online store where you need them." },
  { title: "SEO", desc: "Making your website easy for Google to read and understand." },
  { title: "AI SEO and campaigns", desc: "Making your business easy for tools like ChatGPT and Gemini to understand. We cannot promise a mention, because those tools decide for themselves." },
  { title: "Digital marketing", desc: "Campaigns and regular reports once your website is live." },
  { title: "Digital presence", desc: "Keeping your website, Google Business Profile and listings consistent." },
];
const STEPS = [
  { title: "You tell us about your business", desc: "A short form or a phone call is enough." },
  { title: "We design a free mock-up", desc: "You see your homepage before you commit." },
  { title: "We build and launch", desc: "We take care of the technical side and keep you updated." },
  { title: "We look after it", desc: "Ask for a change and we make it." },
];

// In a draft, anything still in [square brackets] is highlighted so it is easy to see what is left to fill in.
function Fill({ text }) {
  return String(text)
    .split(/(\[[^\]]*\])/)
    .map((part, i) => (/^\[[^\]]*\]$/.test(part) ? <mark key={i} className="rounded bg-accent/60 px-1 text-ink">{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>));
}

export default function TownPage({ town }) {
  const draft = !town.live;
  const faqs = [...town.faqs, ...TOWN_SHARED_FAQS];
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
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
                Is your website slow, out of date, or missing altogether? <Koda /> builds clear, fast websites for local businesses and start-ups, and helps people find them on Google and in AI tools like ChatGPT. See all our{" "}
                <a className="underline underline-offset-4" href="/website-design-durban">website design in Durban</a>.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button onClick={() => scrollToId("contact")}>Get my free mock-up</Button>
              <button type="button" onClick={() => scrollToId("audit")} className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-ink/60">
                <span className="border-b border-ink/40 pb-0.5">Get a free website audit</span>
              </button>
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
            <Headline className="h-section mt-5 max-w-[16ch]">Areas we cover in {town.name}.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <ul className="flex flex-wrap gap-2.5">
              {town.areas.map((a) => (
                <li key={a} className="rounded-full border border-ink/15 px-4 py-2 text-[14px] text-ink/85"><Fill text={a} /></li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="pb-4 pt-4">
        <div className="wrap">
          <FreeMockup />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">What we do</Headline>
          </Reveal>
          <ul className="grid gap-x-16 sm:grid-cols-2">
            {WHAT.map((c) => (
              <Reveal as="li" key={c.title} className="list-none border-t border-ink/15 py-6">
                <h3 className="font-display text-[1.2rem] leading-tight">{c.title}</h3>
                <p className="t-body mt-2.5">{c.desc}</p>
              </Reveal>
            ))}
          </ul>
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
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">How it works</Headline>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="list-none rounded-3xl border border-ink/15 bg-paper p-6">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-[15px] text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="xwide mt-5 text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{s.title}</h3>
                <p className="t-body mt-2.5">{s.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">What it costs</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              Websites start from {PLANS[0].price.replace(/^From /, "")}. Your written quote confirms exactly what is included. See our <a className="underline underline-offset-4" href="/pricing">pricing page</a> for the full plans, and read more <a className="underline underline-offset-4" href="/about">about us</a>.
            </p>
            <p className="t-body mt-5 text-base">
              You can email us on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}.
            </p>
          </Reveal>
        </div>
      </section>

      <Audit />
      <Faq title={`Questions from ${town.name} businesses`} items={faqs} />

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">Website design across Durban</Headline>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li><a className="block rounded-2xl border border-ink/15 bg-paper px-5 py-4 text-[15px] transition-colors hover:border-ink/40" href="/website-design-durban">Website design Durban</a></li>
            {routedTowns().filter((t) => t.slug !== town.slug).map((t) => (
              <li key={t.slug}><a className="block rounded-2xl border border-ink/15 bg-paper px-5 py-4 text-[15px] transition-colors hover:border-ink/40" href={townPath(t)}>Website design {t.name}</a></li>
            ))}
          </ul>
        </div>
      </section>
      <Contact />
    </main>
  );
}
