import React from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { trailFor } from "../trail.js";
import { PROJECTS, PLANS, WORK_FAQS, BUSINESS } from "../content.js";
import { BrowserFrame, Button, Eyebrow, Headline, Reveal, TextLink, Koda } from "../components/ui.jsx";
import Audit from "../components/Audit.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { PHONE, cn, scrollToId } from "../lib/utils.js";

const STEPS = [
  { title: "You tell us about your business", desc: "A short form or a phone call is enough." },
  { title: "We design a free mock-up", desc: "You see your homepage before you commit." },
  { title: "We build and launch", desc: "We take care of the technical side and keep you updated." },
  { title: "We look after it", desc: "Ask for a change and we make it." },
];

const CAN_DO = [
  { title: "Website development", desc: "Fast, clear websites that work on a phone, with booking or an online store where you need them.", href: "/website-developers-in-durban" },
  { title: "SEO", desc: "Making your website easy for Google to read and understand." },
  { title: "AI SEO and campaigns", desc: "Making your business easy for tools like ChatGPT and Gemini to understand. We cannot promise a mention, because those tools decide for themselves." },
  { title: "Digital marketing", desc: "Campaigns and regular reports once your website is live." },
  { title: "Digital presence", desc: "Keeping your website, Google Business Profile and listings consistent." },
];

export default function OurWork() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Breadcrumb trail={trailFor("/our-work")} />
            <Reveal>
              <Eyebrow>Our work</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                Our <em>work.</em>
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                See the websites we have built for real businesses. If you like what you see, you can start with a free mock-up of your own homepage.
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

      <section className="pb-16 lg:pb-24">
        <div className="wrap">
          <h2 className="sr-only">Websites we have built</h2>
          <div className="grid gap-20 sm:gap-28">
            {PROJECTS.map((p, i) => (
              <article key={p.name} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <Reveal className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-2")}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`${p.host}: visit the ${p.name} website (opens in a new tab)`} className="group block">
                    <div className="transition-transform duration-700 ease-out group-hover:-translate-y-1.5" style={{ rotate: i % 2 === 0 ? "-0.8deg" : "0.8deg" }}>
                      <BrowserFrame project={p} />
                    </div>
                  </a>
                </Reveal>
                <Reveal delay={120} className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-1")}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{p.category}</p>
                  <h3 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.05]">{p.name}</h3>
                  <p className="t-body mt-4">{p.blurb}</p>
                  <p className="mt-5 inline-block rounded-full border border-ink/15 px-3.5 py-1.5 text-xs text-muted">{p.tag}</p>
                  <div className="mt-7">
                    <TextLink href={p.url} external>Visit site</TextLink>
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
          <Reveal className="mt-20 max-w-[62ch] border-t border-ink/15 pt-8">
            <h3 className="xwide text-[clamp(1.05rem,2.3vw,1.3rem)] leading-[1.1] tracking-[-0.02em]">More projects are on the way</h3>
            <p className="t-body mt-3">
              <Koda /> is a new studio, so this page is short. We would rather show you real projects than pad it with ones that are not. We add each new project here once the client has agreed. You can read more <a className="underline underline-offset-4" href="/about">about the studio</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Headline className="h-section">What every project starts with</Headline>
            </div>
            <p className="t-body text-base lg:col-span-6 lg:col-start-7">
              You do not have to take our word for it. Before you pay anything, we design a free mock-up of your homepage, so you can judge our work on your own business.
            </p>
          </Reveal>
          <Reveal className="mt-14">
            <h3 className="xwide text-[clamp(1.05rem,2.3vw,1.3rem)] leading-[1.1] tracking-[-0.02em]">How we work</h3>
          </Reveal>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="list-none rounded-3xl border border-ink/15 bg-paper p-6">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-[15px] text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="xwide mt-5 text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{s.title}</h4>
                <p className="t-body mt-2.5">{s.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">What we can do for your business</Headline>
          </Reveal>
          <ul className="grid gap-x-16 sm:grid-cols-2">
            {CAN_DO.map((c) => (
              <Reveal as="li" key={c.title} className="list-none border-t border-ink/15 py-6">
                <h3 className="font-display text-[1.2rem] leading-tight">{c.href ? <a href={c.href} className="underline-offset-4 hover:underline">{c.title}</a> : c.title}</h3>
                <p className="t-body mt-2.5">{c.desc}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">What does it cost?</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              Websites start from {PLANS[0].price.replace(/^From /, "")}. Your written quote confirms exactly what is included. See all our plans on the <a className="underline underline-offset-4" href="/pricing">pricing page</a>.
            </p>
            <p className="t-body mt-5 text-base">
              You can also email us on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}. For Durban businesses, see our <a className="underline underline-offset-4" href="/website-design-durban">website design in Durban</a> page.
            </p>
          </Reveal>
        </div>
      </section>

      <Audit />
      <Faq title="Questions about our work" items={WORK_FAQS} />
      <Contact />
    </main>
  );
}
