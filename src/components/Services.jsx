import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";
import CardDeck from "./CardDeck.jsx";
import art1 from "../assets/service-1-website-design.webp";
import art2 from "../assets/service-2-branding.webp";
import art3 from "../assets/service-3-redesign.webp";
import art4 from "../assets/service-4-ecommerce.webp";
import art5 from "../assets/service-5-booking.webp";
import art6 from "../assets/service-6-google-profile.webp";
import art7 from "../assets/service-7-seo.webp";
import art8 from "../assets/service-8-maintenance.webp";
import art9 from "../assets/service-9-social.webp";
import { Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, ShieldCheck, ShareNetwork } from "@phosphor-icons/react";

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

const SERVICE_ICONS = [Browser, PenNib, ArrowsClockwise, ShoppingBag, CalendarCheck, MapPin, MagnifyingGlass, ShieldCheck, ShareNetwork];

// One picture per service, set in a rounded panel so it sits cleanly on any card colour. The cards cycle white,
// black and lime like before; `pos` keeps the main subject of each picture in frame.
const SURFACES = [
  { card: "bg-paper text-ink", body: "text-ink/80", tile: "bg-accent text-ink" },
  { card: "keep-light bg-ink text-paper", body: "text-paper/80", tile: "bg-accent text-ink" },
  { card: "bg-accent text-ink", body: "text-ink/80", tile: "bg-ink text-accent" },
];

const ART = [
  { src: art1, w: 1400, h: 934, pos: "50% 40%" },
  { src: art2, w: 1400, h: 764, pos: "55% 50%" },
  { src: art3, w: 1400, h: 934, pos: "55% 40%" },
  { src: art4, w: 1400, h: 934, pos: "50% 40%" },
  { src: art5, w: 1400, h: 934, pos: "50% 40%" },
  { src: art6, w: 1400, h: 934, pos: "50% 40%" },
  { src: art7, w: 1400, h: 934, pos: "50% 40%" },
  { src: art8, w: 1400, h: 934, pos: "50% 45%" },
  { src: art9, w: 1400, h: 764, pos: "50% 50%" },
];

function ServiceCard({ s, i }) {
  const art = ART[i % ART.length];
  const surface = SURFACES[i % SURFACES.length];
  const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${surface.card}`}>
      <img
        src={art.src}
        width={art.w}
        height={art.h}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="svc-art absolute rounded-[18px] object-cover shadow-[0_18px_40px_-24px_rgba(16,16,16,0.5)] ring-1 ring-black/10 md:rounded-[22px]"
        style={{ objectPosition: art.pos }}
      />
      <div className="relative z-10 flex h-full flex-col justify-end gap-2.5 p-5 text-left sm:p-7 md:w-[40%] md:justify-center md:gap-4 md:p-10 [@media(max-height:520px)]:justify-center [@media(max-height:520px)]:p-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${surface.tile} md:h-14 md:w-14 [@media(max-height:520px)]:hidden`}>
          <Icon size={24} weight="bold" aria-hidden="true" />
        </span>
        <h3 className="xwide text-[clamp(1.2rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.03em]">{s.title}</h3>
        <p className={`max-w-[38ch] text-[14px] leading-[1.55] ${surface.body} md:text-[clamp(15px,1.4vw,17px)] md:leading-[1.6]`}>{s.desc}</p>
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
