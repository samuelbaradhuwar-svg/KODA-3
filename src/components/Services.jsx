import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";
import CardDeck from "./CardDeck.jsx";
import { SERVICE_ART } from "./ServiceArt.jsx";
import { Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, Sparkle, ShieldCheck, ShareNetwork } from "@phosphor-icons/react";

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

const SERVICE_ICONS = [Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, Sparkle, ShieldCheck, ShareNetwork];

// One picture per service, drawn in the hero card look (see ServiceArt.jsx) and set in a rounded panel, so it sits
// cleanly on any card colour. The cards cycle dark, lime and light.
const SURFACES = [
  { card: "keep-light bg-ink text-paper", body: "text-paper/80", tile: "bg-accent text-ink" },
  { card: "bg-accent text-ink", body: "text-ink/80", tile: "bg-ink text-accent" },
  { card: "bg-paper text-ink", body: "text-ink/80", tile: "bg-accent text-ink" },
];

function ServiceCard({ s, i }) {
  const Art = SERVICE_ART[i % SERVICE_ART.length];
  const surface = SURFACES[i % SURFACES.length];
  const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${surface.card}`}>
      <div className="svc-art absolute overflow-hidden rounded-[18px] bg-[#E8E7E5] shadow-[0_18px_40px_-24px_rgba(16,16,16,0.5)] ring-1 ring-black/10 md:rounded-[22px]" aria-hidden="true">
        <Art />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-end gap-2.5 p-5 text-left sm:p-7 md:w-[40%] md:justify-center md:gap-4 md:p-10 [@media(max-height:520px)]:w-[44%] [@media(max-height:520px)]:justify-center [@media(max-height:520px)]:gap-1.5 [@media(max-height:520px)]:p-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${surface.tile} md:h-14 md:w-14 [@media(max-height:520px)]:hidden`}>
          <Icon size={24} weight="bold" aria-hidden="true" />
        </span>
        <h3 className="xwide text-[clamp(1.2rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.03em] [@media(max-height:520px)]:text-[1rem]">{s.title}</h3>
        <p className={`max-w-[38ch] text-[14px] leading-[1.55] ${surface.body} md:text-[clamp(15px,1.4vw,17px)] md:leading-[1.6] [@media(max-height:520px)]:text-[12.5px] [@media(max-height:520px)]:leading-[1.45]`}>{s.desc}</p>
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
