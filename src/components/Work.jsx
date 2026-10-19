import React from "react";
import { PROJECTS } from "../content.js";
import { BrowserFrame, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { cn, scrollToId } from "../lib/utils.js";

export default function Work() {
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Selected work</Eyebrow>
            <Headline className="h-section mt-5 max-w-[14ch]">Real businesses. Real results.</Headline>
          </Reveal>
          <Reveal delay={100}>
            <TextLink href="#contact" onClick={(e) => { e.preventDefault(); scrollToId("contact"); }}>Start your project</TextLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-20 sm:mt-20 sm:gap-28">
          {PROJECTS.map((p, i) => (
            <article key={p.name} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <Reveal className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-2")}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`${p.host}: visit the ${p.name} website (opens in a new tab)`} className="group block">
                  <div className="transition-transform duration-700 ease-out group-hover:-translate-y-1.5" style={{ rotate: i % 2 === 0 ? "-0.8deg" : "0.8deg" }}>
                    <BrowserFrame project={p} />
                  </div>
                </a>
              </Reveal>
              <Reveal delay={120} className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-1")}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{p.category}</p>
                <h3 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.05]">{p.name}</h3>
                <p className="t-body mt-4">{p.blurb}</p>
                <p className="mt-5 inline-block rounded-full border border-ink/15 px-3.5 py-1.5 text-xs text-muted">{p.tag}</p>
                <div className="mt-7">
                  <TextLink href={p.url} external>Visit site</TextLink>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
