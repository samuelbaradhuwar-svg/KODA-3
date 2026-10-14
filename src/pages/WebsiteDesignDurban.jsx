import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Reveal } from "../components/ui.jsx";
import { ServiceList } from "../components/Services.jsx";
import Process from "../components/Process.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import { scrollToId } from "../lib/utils.js";

const INCLUDED = ["Website Design", "Website Redesign", "Booking Systems", "Ecommerce Stores", "Google Business Profile", "SEO Optimisation", "Website Maintenance"];

export default function WebsiteDesignDurban() {
  return (
    <main>
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Reveal>
              <Eyebrow>Website design in Durban</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="h-display mt-6">
                Website design for <em className="text-accent">Durban</em> businesses.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                KODA is a Durban web design studio. We design and build professional websites for small and medium sized businesses, set up your Google Business profile, and handle the technical side so customers can find you, trust you and get in touch.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
              <a href="/#pricing" className="border-b border-ink/40 pb-0.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
                See our plans
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 className="h-section">Who our websites are for</h2>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="t-body text-base">
              We work with small and medium sized businesses that need a professional online presence: service providers, trades, clinics, salons, restaurants, retailers and growing local companies. If customers look for you on Google or check your website before they call, a clear, fast website helps.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <h2 className="h-section mb-14 max-w-[18ch]">What we can build and set up for you</h2>
          </Reveal>
          <ServiceList items={SERVICES.filter((s) => INCLUDED.includes(s.title))} />
        </div>
      </section>

      <div className="bg-paper2">
        <Process />
      </div>
      <Faq title="Questions about web design in Durban" />
      <Contact />
    </main>
  );
}
