import React from "react";
import { DEV_SERVICES, DEV_FAQS, BUSINESS } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, Koda } from "../components/ui.jsx";
import { ServiceList } from "../components/Services.jsx";
import FreeMockup from "../components/FreeMockup.jsx";
import Audit from "../components/Audit.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { PHONE, scrollToId } from "../lib/utils.js";

const STEPS = [
  { title: "You tell us about your business", desc: "A short form or a phone call is enough." },
  { title: "We design a free mock-up", desc: "You see your homepage before you commit." },
  { title: "We build and launch", desc: "We take care of the technical side and keep you updated." },
  { title: "We look after it", desc: "Ask for a change and we make it." },
];

export default function WebsiteDevelopers() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Reveal>
              <Eyebrow>Website developers in Durban</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                Website developers in <em>Durban.</em>
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                Is your website slow, out of date, or missing altogether? <Koda /> is a team of website developers in Durban. We build clear, fast websites for local businesses and start-ups,{" "}
                <a className="underline underline-offset-4" href="/website-design-durban">designed around how your customers look for you</a>, then help people find you on Google and in AI tools like ChatGPT.
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

      <section className="pb-4">
        <div className="wrap">
          <FreeMockup />
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">Who we work with</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We work with local businesses and start-ups across South Africa. Maybe you run a salon, a trade, a clinic or a shop. Maybe you are just getting started and need a proper website to send people to. You do not need to understand the technical side. We handle that, and we explain things in plain English. Learn more <a className="underline underline-offset-4" href="/about">about us</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-14 max-w-[18ch]">What we do</Headline>
          </Reveal>
          <ServiceList items={DEV_SERVICES} />
        </div>
      </section>

      <section className="sec bg-paper2">
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
          <p className="t-body mt-8 max-w-[62ch]">
            Our prices are published openly on our <a className="underline underline-offset-4" href="/pricing">pricing page</a>, and your written quote confirms exactly what is included. You can email us on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}.
          </p>
        </div>
      </section>

      <Audit />
      <Faq title="Questions about website developers" items={DEV_FAQS} />
      <Contact />
    </main>
  );
}
