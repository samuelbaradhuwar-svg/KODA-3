import React from "react";
import { OUTCOMES, WHY_US } from "../content.js";
import { UsersThree, MapPinArea, TrendUp, Coins, Lightning, DeviceMobile, ShieldCheck, Timer } from "@phosphor-icons/react";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import SpotlightGrid from "./SpotlightGrid.jsx";
import CardCopy from "./CardCopy.jsx";

const OUTCOME_ICONS = [UsersThree, MapPinArea, TrendUp, Coins];
const WHY_ICONS = [Lightning, DeviceMobile, ShieldCheck, Timer];

export default function About() {
  return (
    <section id="about" className="sec bg-ink text-paper">
      <div className="wrap">
        <div>
          <Reveal>
            <Eyebrow light>Why local businesses choose us</Eyebrow>
            <Headline light className="h-section mt-5 max-w-[16ch]">
              A website that works as hard as <em>you do.</em>
            </Headline>
          </Reveal>
          <SpotlightGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 70} className="list-none">
                <article className="spot-card group h-full min-h-[17rem]">
                  <CardCopy icon={WHY_ICONS[i % WHY_ICONS.length]} title={w.title} desc={w.desc} tone="ink" size="sm" className="transition-transform duration-500 group-hover:-translate-y-0.5" />
                </article>
              </Reveal>
            ))}
          </SpotlightGrid>
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
                  <article className="spot-card group h-full min-h-[17rem]">
                    <CardCopy icon={Icon} title={o.title} desc={o.desc} tone="ink" size="sm" className="transition-transform duration-500 group-hover:-translate-y-0.5" />
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
