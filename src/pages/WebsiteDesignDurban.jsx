import React from "react";
import { SERVICES, PLANS, PROJECTS, DURBAN_FAQS } from "../content.js";
import { BrowserFrame, Button, Eyebrow, Headline, Reveal, TextLink, Koda } from "../components/ui.jsx";
import { ServiceCard } from "../components/Services.jsx";
import CardDeck from "../components/CardDeck.jsx";
import Process from "../components/Process.jsx";
import Audit from "../components/Audit.jsx";
import Faq from "../components/Faq.jsx";
import PageLinks from "../components/PageLinks.jsx";
import Contact from "../components/Contact.jsx";
import { scrollToId } from "../lib/utils.js";
import { routedTowns, townPath } from "../towns.js";

// Why a Durban business would pick us. Every line is something the site already says elsewhere.
const WHY = [
  { title: "See it before you pay", desc: "We design a free mock-up of your homepage first. If you like it, we carry on. If not, you owe us nothing." },
  { title: "Found on Google and in AI answers", desc: "SEO and AI SEO setup come with the websites we build, so your business is easy for Google and for tools like ChatGPT to understand." },
  { title: "Prices you can see", desc: `Websites start from ${PLANS[0].price.replace(/^From /, "")}, and your written quote confirms exactly what is included.` },
  { title: "We look after it", desc: "Hosting, security and backups are included, and our monthly plans cover updates, so there is no system to learn." },
  { title: "Honest about results", desc: "We never promise a ranking, a number of calls, or a date we cannot keep." },
];

export default function WebsiteDesignDurban() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li><a className="underline-offset-4 hover:underline" href="/">Home</a></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink">Website design in Durban</li>
              </ol>
            </nav>
            <Reveal>
              <Eyebrow>Website design in Durban</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                Website design for <em>Durban</em> businesses.
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                <Koda /> is a Durban web design studio. We design and build professional websites for small and medium sized businesses, run AI SEO and ad campaigns so customers can find you on Google and in AI answers like ChatGPT and Gemini, and handle the technical side so they can trust you and get in touch.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button onClick={() => scrollToId("contact")}>Get my free mock-up</Button>
              <button type="button" onClick={() => scrollToId("audit")} className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-ink/60">
                <span className="border-b border-ink/40 pb-0.5">Get a free website audit</span>
              </button>
            </Reveal>
            <Reveal delay={300}>
              <ul className="mt-10 flex flex-wrap gap-2.5 text-[13px] text-ink/80">
                {["Free homepage mock-up", "Free website audit", `Websites from ${PLANS[0].price.replace(/^From /, "")}`].map((t) => (
                  <li key={t} className="rounded-full border border-ink/15 px-3.5 py-1.5">{t}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section max-w-[14ch]">Built for Durban. Built to be found.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We work with service providers, trades, clinics, salons, restaurants, retailers and growing local companies. Your customers check your website, your Google listing and, more and more, an AI assistant before they call. A clear, fast website and good AI SEO help you show up well in all three.
            </p>
            <p className="t-body mt-5 text-base">
              We cannot promise rankings or a mention in ChatGPT, because those tools decide for themselves. What we do is make your business easy for them to read, and tell you plainly what we have done.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="services" className="sec">
        <div className="wrap">
          <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <Eyebrow>What we do</Eyebrow>
              <Headline className="h-section mt-5">A website, and everything around it.</Headline>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
              <p className="t-body">From your first website to AI SEO, ad campaigns and ongoing care, one Durban studio for every step.</p>
              <div className="mt-5">
                <TextLink href="/website-developers-in-durban">Website developers in Durban</TextLink>
              </div>
            </Reveal>
          </div>
          <CardDeck items={SERVICES} label="Our services" renderCard={(s, i) => <ServiceCard s={s} i={i} />} />
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal>
            <Eyebrow>Why Durban businesses choose us</Eyebrow>
            <Headline className="h-section mt-5 mb-12 max-w-[18ch]">What you get with KODA.</Headline>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 60} className="list-none rounded-3xl border border-ink/15 bg-paper p-7">
                <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-2xl bg-accent font-display text-[14px] text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="xwide mt-5 text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{w.title}</h3>
                <p className="t-body mt-2.5">{w.desc}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <Eyebrow>Our work</Eyebrow>
              <Headline className="h-section mt-5 max-w-[16ch]">Websites we have built.</Headline>
            </Reveal>
            <Reveal delay={100}>
              <TextLink href="/our-work">See all our work</TextLink>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`${p.host}: visit the ${p.name} website (opens in a new tab)`} className="group block">
                  <div className="transition-transform duration-700 ease-out group-hover:-translate-y-1.5">
                    <BrowserFrame project={p} />
                  </div>
                </a>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{p.category}</p>
                <h3 className="mt-2 font-display text-[1.4rem] leading-[1.1]">{p.name}</h3>
                <p className="t-body mt-2">{p.blurb}</p>
              </Reveal>
            ))}
          </div>
          <p className="t-body mt-10 max-w-[62ch]">
            We are a new studio, so we only show real projects, and add each new one once the client has agreed.
          </p>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal>
            <Eyebrow>Prices</Eyebrow>
            <Headline className="h-section mt-5 mb-12 max-w-[18ch]">Prices you can see.</Headline>
          </Reveal>
          <ul className="grid gap-4 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal as="li" key={p.name} delay={i * 70} className="list-none rounded-3xl border border-ink/15 bg-paper p-7">
                <h3 className="xwide text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{p.name}</h3>
                <p aria-hidden={!p.price.startsWith("From ") || undefined} className="mt-4 h-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{p.price.startsWith("From ") ? "From" : " "}</p>
                <p className="mt-2 font-display text-[2.2rem] leading-none">{p.price.replace(/^From /, "")}</p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{p.note}</p>
                <p className="t-body mt-4">{p.desc}</p>
                <p className="mt-4 text-[14px] text-muted">Typical timeline: {p.timeline}</p>
              </Reveal>
            ))}
          </ul>
          <p className="t-body mt-8 max-w-[62ch]">
            Your written quote confirms exactly what is included. See every plan, including monthly care, on our <a className="underline underline-offset-4" href="/pricing">pricing page</a>.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section max-w-[14ch]">Durban, and beyond.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We are based in Durban and work with businesses here and across South Africa. Not sure whether we can help in your area? Ask us, and read more <a className="underline underline-offset-4" href="/about">about the studio</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="bg-paper2">
        <Process />
      </div>

      <Audit />
      <Faq title="Questions about web design in Durban" items={DURBAN_FAQS} />

      <section className="sec">
        <div className="wrap">
          <Reveal className="grid items-center gap-6 rounded-[2rem] bg-accent px-6 py-10 text-ink sm:px-12 sm:py-14 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70">Ready when you are</p>
              <h2 className="xwide mt-4 text-[clamp(1.4rem,2.7vw,2.4rem)] leading-[1.06] tracking-[-0.02em]">Ready to build your Durban website?</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-ink/75">
                Ask for a free homepage mock-up, or a free check of your current website. There is no cost and no obligation.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button onClick={() => scrollToId("contact")}>Get my free mock-up</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {routedTowns().length > 0 && (
        <section className="sec bg-paper2">
          <div className="wrap">
            <Reveal>
              <Eyebrow>Areas we serve</Eyebrow>
              <Headline className="h-section mt-5 mb-12 max-w-[18ch]">Website design across Durban.</Headline>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {routedTowns().map((t) => (
                <li key={t.slug}>
                  <a className="block rounded-2xl border border-ink/15 bg-paper px-5 py-4 text-[15px] transition-colors hover:border-ink/40" href={townPath(t)}>Website design {t.name}{t.live ? "" : " (draft)"}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <PageLinks title="More from KODA" className="sec" />
      <Contact />
    </main>
  );
}
