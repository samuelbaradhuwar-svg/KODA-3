import React from "react";
import { ECOM_FAQS, STORE_FROM, BUSINESS } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, Koda } from "../components/ui.jsx";
import { ServiceList } from "../components/Services.jsx";
import FreeMockup from "../components/FreeMockup.jsx";
import Audit from "../components/Audit.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { PHONE, scrollToId } from "../lib/utils.js";

const FITS = [
  "You sell products and want customers to order without phoning or messaging first.",
  "You already sell in person or through social media and want a proper shop of your own.",
  "You are starting a new business and want to sell online from day one.",
];

const STORE_PARTS = [
  { title: "A store that works on a phone", desc: "Most of your customers will browse and buy on their phones, so we design the store for mobile first and then make it work on bigger screens." },
  { title: "Secure checkout", desc: "Customers pay through a secure checkout, so buying feels safe and simple." },
  { title: "Stock and product management", desc: "Your products and stock levels are set up so that what the website shows matches what you have." },
  { title: "Clear product pages", desc: "Good photos, honest descriptions and clear prices help customers decide. We structure each product page so it is easy to read and easy for Google to understand." },
  { title: "Hosting, security and backups", desc: "Your store is hosted securely, with SSL, regular backups and monitoring, so you do not have to think about it." },
];

const FOUND = [
  { title: "SEO", desc: "We make your store easy for Google to read and understand, with clear titles, descriptions and product details." },
  { title: "AI SEO", desc: "More people now ask ChatGPT and other AI tools where to buy. We make your products and business details easy for these tools to read. AI tools decide for themselves what to recommend, so we cannot promise a mention, but we give your store a fair chance." },
  { title: "Digital marketing and campaigns", desc: "Once your store is live, we can help you get it seen with campaigns and regular reports on what we have done." },
  { title: "Digital presence", desc: "Your store, your Google Business Profile and your online listings should all say the same thing, so we help keep them consistent." },
];

const STEPS = [
  { title: "You tell us about your business and your products", desc: "A short form or a phone call is enough." },
  { title: "We design a free mock-up", desc: "You see your homepage before you commit." },
  { title: "We quote in writing", desc: "Your quote lists exactly what is included, so there are no surprises." },
  { title: "We build and launch your store", desc: "We set up your products, checkout and hosting, and keep you updated." },
  { title: "We look after it", desc: "Ask for a change and we make it. Our monthly plans cover ongoing updates and support." },
];

export default function Ecommerce() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Reveal>
              <Eyebrow>Online stores</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                Ecommerce website <em>design.</em>
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                Selling online should not feel like learning a new trade. <Koda /> builds online stores for local businesses and start-ups, so you can show your products, take orders and get paid, while we handle the technical side. See our{" "}
                <a className="underline underline-offset-4" href="/website-developers-in-durban">website development</a> for businesses in Durban and across South Africa.
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
            <Headline className="h-section">Who this is for</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">An online store suits you if:</p>
            <ul className="mt-4 grid gap-3">
              {FITS.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] leading-[1.6] text-ink/85">
                  <span aria-hidden="true" className="mt-[0.5em] h-2.5 w-2.5 shrink-0 rounded-[3px] bg-accent ring-1 ring-ink/50" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="t-body mt-5 text-base">You do not need to understand the technical side. We explain things in plain English.</p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-14 max-w-[20ch]">What goes into your online store</Headline>
          </Reveal>
          <ServiceList items={STORE_PARTS} />
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-14 max-w-[20ch]">Helping people find your store</Headline>
            <p className="t-body -mt-8 mb-12 max-w-[56ch]">A store nobody finds does not sell, so we set yours up to be found.</p>
          </Reveal>
          <ServiceList items={FOUND} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">How it works</Headline>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="list-none rounded-3xl border border-ink/15 bg-paper p-6">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-[15px] text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="xwide mt-5 text-[1rem] leading-[1.12] tracking-[-0.02em]">{s.title}</h3>
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
              Online stores are priced to suit what you need, so we quote for each one. Online stores start from {STORE_FROM}, and your written quote confirms exactly what is included. Most websites with an online store take two to four weeks, depending on how many products you have and how quickly we receive your photos and descriptions. See the full plans on our <a className="underline underline-offset-4" href="/pricing">pricing page</a>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">Our work</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We are a new studio, so we only show real projects. The Blooming Bilingual is a website we built with lesson credits, open-slot booking and a student login, which shows how we handle sites where customers pay and sign in. You can see it on our <a className="underline underline-offset-4" href="/our-work">work page</a>. We will add online store projects there as soon as clients agree. Read more <a className="underline underline-offset-4" href="/about">about the studio</a>.
            </p>
            <p className="t-body mt-5 text-base">
              You can email us on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}.
            </p>
          </Reveal>
        </div>
      </section>

      <Audit />
      <Faq title="Questions about online stores" items={ECOM_FAQS} />
      <Contact />
    </main>
  );
}
