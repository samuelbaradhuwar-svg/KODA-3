import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";
import CardDeck from "./CardDeck.jsx";

export function ServiceList({ items = SERVICES }) {
  return (
    <ol className="grid gap-x-16 sm:grid-cols-2">
      {items.map((s, i) => (
        <Reveal as="li" key={s.title} delay={(i % 2) * 80} className="group grid grid-cols-[2.75rem_1fr] gap-3 border-t border-ink/15 py-7">
          <span className="pt-2 text-xs font-semibold tracking-[0.14em] text-muted">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="font-display text-[1.2rem] leading-tight transition-colors duration-300 group-hover:text-ink/55">{s.title}</h3>
            <p className="t-body mt-2.5">{s.desc}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

const SURFACES = ["bg-paper text-ink", "bg-ink text-paper", "bg-accent text-ink"];

function ServiceCard({ s, i, total, className = "" }) {
  const dark = i % SURFACES.length === 1;
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${SURFACES[i % SURFACES.length]} ${className}`}>
      <div className="grid h-full content-between gap-6 p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12 [@media(max-height:520px)]:grid-cols-12 [@media(max-height:520px)]:gap-x-6 [@media(max-height:520px)]:gap-y-2 [@media(max-height:520px)]:p-5">
        <div className="flex items-start justify-between lg:col-span-12 [@media(max-height:520px)]:col-span-12">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">KODA</span>
        </div>
        <span aria-hidden="true" className="xwide text-[clamp(3.5rem,13vw,8rem)] leading-[0.85] tracking-[-0.04em] lg:col-span-4 [@media(max-height:520px)]:col-span-4 [@media(max-height:520px)]:self-end [@media(max-height:520px)]:text-[3.5rem]">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="self-end lg:col-span-7 lg:col-start-6 [@media(max-height:520px)]:col-span-7 [@media(max-height:520px)]:col-start-6">
          <h3 className="xwide text-[clamp(1.35rem,3.4vw,2.6rem)] leading-[1.04] tracking-[-0.03em] [@media(max-height:520px)]:text-[1.25rem]">{s.title}</h3>
          <p className={`mt-4 max-w-[34ch] text-[clamp(15px,1.4vw,18px)] leading-[1.55] sm:max-w-[48ch] ${dark ? "text-paper/70" : "text-ink/75"}`}>{s.desc}</p>
        </div>
      </div>
    </article>
  );
}

export default function Services() {
  return (
    <section id="services" className="sec bg-paper2">
      <div className="wrap">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>What we do</Eyebrow>
            <Headline className="h-section mt-5">Everything your business needs to succeed online.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="t-body">From your first website to ongoing SEO and support, one studio for every step.</p>
            <div className="mt-5">
              <TextLink href="/website-design-durban">Website design in Durban</TextLink>
            </div>
          </Reveal>
        </div>
        <CardDeck items={SERVICES} label="Our services" renderCard={(s, i, n) => <ServiceCard s={s} i={i} total={n} />} />

        <Reveal className="mt-16 sm:mt-24 grid items-center gap-6 rounded-[2rem] bg-accent px-6 py-10 text-ink sm:px-12 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">Starting from scratch?</p>
            <h3 className="xwide mt-4 text-[clamp(1.4rem,2.7vw,2.4rem)] leading-[1.06] tracking-[-0.02em]">Just an idea? No pressure.</h3>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-ink/75">
              Many businesses begin with nothing more than a name or a sketch. Tell us what you have in mind and we will help shape the logo, the brand and the website, at your pace, with no obligation.
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Button onClick={() => scrollToId("contact")}>Share your idea</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
