import React from "react";
import { PILLARS } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";

export default function Pillars() {
  return (
    <section className="sec bg-paper2">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>The KODA advantage</Eyebrow>
            <Headline className="h-section mt-5">
              From local business to <em>local brand.</em>
            </Headline>
            <p className="t-body mt-6">
              A professional website, a verified Google Business profile and a consistent digital presence builds trust, gets you seen and turns interest into customers.
            </p>
          </Reveal>
        </div>
        <ol className="lg:col-span-7 lg:col-start-6">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="group grid grid-cols-[4.5rem_1fr] gap-4 border-t border-ink/15 py-8 first:border-t-0 first:pt-0 sm:grid-cols-[7rem_1fr]">
              <span className="pt-2 text-xs font-semibold tracking-[0.14em] text-muted">0{i + 1} / 0{PILLARS.length}</span>
              <div>
                <h3 className="font-display text-[2rem] leading-none transition-colors duration-300 group-hover:text-ink/55 sm:text-[2.6rem]">{p.title}</h3>
                <p className="t-body mt-3">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
