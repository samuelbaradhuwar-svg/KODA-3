import React from "react";
import { OUTCOMES, WHY_US } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";

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
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o, i) => (
              <Reveal as="li" key={o.title} delay={i * 80} className="border-t border-paper/15 py-7 pr-6 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0">
                <h3 className="font-display text-[2rem] leading-[1]">{o.title}</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-paper/60">{o.desc}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
