import React from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { trailFor } from "../trail.js";
import { SERVICES, BUSINESS } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, Koda } from "../components/ui.jsx";
import { ServiceList } from "../components/Services.jsx";
import Process from "../components/Process.jsx";
import Contact from "../components/Contact.jsx";
import { PHONE, scrollToId } from "../lib/utils.js";

export default function AboutPage() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Breadcrumb trail={trailFor("/about")} />
            <Reveal>
              <Eyebrow>About us</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                A Durban studio for <em>local</em> businesses.
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                <Koda /> is a web design studio in Durban, KwaZulu-Natal. We design and build websites for small and medium sized businesses, set up their Google and AI search presence, and look after the technical side afterwards, so owners can get on with running their business.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
              <a href="/pricing" className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-ink/60">
                <span className="border-b border-ink/40 pb-0.5">See our pricing</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">Who you deal with</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              <Koda /> is a sole proprietorship run by {BUSINESS.informationOfficer}. We keep the team small on purpose: you talk to the people who plan and build your website, from the first call to launch and after.
            </p>
            <p className="t-body mt-5 text-base">
              You can reach us by email on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-14 max-w-[18ch]">What we do</Headline>
          </Reveal>
          <ServiceList items={SERVICES} />
        </div>
      </section>

      <div className="bg-paper2">
        <Process />
      </div>

      <section className="sec">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Headline className="h-section">How we talk about results</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We cannot promise rankings, or that an AI assistant will recommend your business, and we do not sell that promise. What we can do is make your business easy for Google and AI tools to find and understand, build a fast, clear website, and report on what we have done. Prices are published openly on our <a className="underline underline-offset-4" href="/pricing">pricing page</a>, and your written quote confirms exactly what is included.
            </p>
          </Reveal>
        </div>
      </section>

      <Contact />
    </main>
  );
}
