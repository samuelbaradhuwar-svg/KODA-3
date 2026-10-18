import React from "react";
import { OUTCOMES, WHY_US } from "../content.js";
import { UsersThree, MapPinArea, TrendUp, Coins } from "@phosphor-icons/react";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import SpotlightGrid from "./SpotlightGrid.jsx";

const OUTCOME_ICONS = [UsersThree, MapPinArea, TrendUp, Coins];

export default function About() {
  return (
    <section id="about" className="sec bg-ink text-paper">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <Eyebrow light>Why local businesses choose us</Eyebrow>
            <Headline light className="h-section mt-5">
              A website that works as hard as <em>you do.</em>
            </Headline>
          </Reveal>
          <ul className="grid gap-x-12 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {WHY_US.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 70} className="border-t border-paper/15 py-6">
                <h3 className="text-lg font-medium">{w.title}</h3>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.7] text-paper/60">{w.desc}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="mt-24 sm:mt-32">
          <Reveal>
            <Eyebrow light>The result</Eyebrow>
            <Headline light className="h-section mt-5 max-w-[16ch]">What this means for your business.</Headline>
          </Reveal>
          <SpotlightGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o, i) => {
              const Icon = OUTCOME_ICONS[i % OUTCOME_ICONS.length];
              return (
                <Reveal as="li" key={o.title} delay={i * 80} className="list-none">
                  <article className="spot-card group flex h-full min-h-[17rem] flex-col p-7">
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-ink transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                        <Icon size={24} weight="bold" aria-hidden="true" />
                      </span>
                      <span aria-hidden="true" className="xwide text-[2.4rem] leading-none tracking-[-0.04em] text-paper/15 transition-colors duration-500 group-hover:text-accent/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="pt-12">
                      <h3 className="font-display text-[1.4rem] leading-[1.1]">{o.title}</h3>
                      <p className="mt-4 text-[15px] leading-[1.7] text-paper/65">{o.desc}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </SpotlightGrid>
        </div>
      </div>
    </section>
  );
}
