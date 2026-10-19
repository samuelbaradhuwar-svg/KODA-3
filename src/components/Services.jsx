import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";
import CardDeck from "./CardDeck.jsx";
import CardCopy from "./CardCopy.jsx";
import { Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, ShieldCheck, EnvelopeSimple } from "@phosphor-icons/react";

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

const SERVICE_ICONS = [Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, ShieldCheck, EnvelopeSimple];
const TONES = ["paper", "ink", "accent"];

function ServiceCard({ s, i }) {
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${SURFACES[i % SURFACES.length]}`}>
      <CardCopy icon={SERVICE_ICONS[i % SERVICE_ICONS.length]} title={s.title} desc={s.desc} tone={TONES[i % TONES.length]} />
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
        <CardDeck items={SERVICES} label="Our services" renderCard={(s, i, n) => <ServiceCard s={s} i={i} />} />

        <Reveal className="mt-16 sm:mt-24 grid items-center gap-6 rounded-[2rem] bg-accent px-6 py-10 text-ink sm:px-12 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70">Starting from scratch?</p>
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
