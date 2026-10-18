import React from "react";
import { PROCESS } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import CardDeck from "./CardDeck.jsx";

// Alternating surfaces, all from the site palette.
const SURFACES = [
  "bg-paper2 text-ink",
  "bg-ink text-paper",
  "bg-accent text-ink",
  "bg-ink text-paper",
];

function ProcessCard({ s, i, total }) {
  const dark = SURFACES[i % SURFACES.length].includes("text-paper");
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${SURFACES[i % SURFACES.length]}`}>
      <div className="grid h-full content-between gap-6 p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12 [@media(max-height:520px)]:grid-cols-12 [@media(max-height:520px)]:gap-x-6 [@media(max-height:520px)]:gap-y-2 [@media(max-height:520px)]:p-5">
        <div className="flex items-start justify-between lg:col-span-12 [@media(max-height:520px)]:col-span-12">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">
            Step {s.n} / {String(total).padStart(2, "0")}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {PROCESS.map((_, d) => (
              <span key={d} className={`h-1.5 rounded-full ${d === i ? "w-6 bg-current" : "w-1.5 bg-current opacity-30"}`} />
            ))}
          </span>
        </div>
        <span aria-hidden="true" className="xwide text-[clamp(4rem,15vw,9rem)] leading-[0.8] tracking-[-0.04em] lg:col-span-5 [@media(max-height:520px)]:col-span-5 [@media(max-height:520px)]:self-end [@media(max-height:520px)]:text-[3.5rem]">
          {s.n}
        </span>
        <div className="self-end lg:col-span-6 lg:col-start-7 [@media(max-height:520px)]:col-span-6 [@media(max-height:520px)]:col-start-7">
          <h3 className="xwide text-[clamp(1.6rem,4vw,3.4rem)] leading-[1] tracking-[-0.03em] [@media(max-height:520px)]:text-[1.4rem]">{s.title}</h3>
          <p className={`mt-4 max-w-[28ch] text-[clamp(15px,1.5vw,20px)] leading-[1.55] sm:max-w-[34ch] ${dark ? "text-paper/70" : "text-ink/75"}`}>{s.desc}</p>
        </div>
      </div>
    </article>
  );
}

export default function Process() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Our process</Eyebrow>
            <Headline className="h-section mt-5">A process built to grow your business.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="t-body">Every step has one job: put your business in front of more customers.</p>
          </Reveal>
        </div>

        <div className="mt-8 sm:mt-12">
          <CardDeck items={PROCESS} label="Our process" step={0.8} renderCard={(s, i, n) => <ProcessCard s={s} i={i} total={n} />} />
        </div>
      </div>
    </section>
  );
}
