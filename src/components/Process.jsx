import React from "react";
import { PROCESS } from "../content.js";
import { Eyebrow, Reveal } from "./ui.jsx";

export default function Process() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Our process</Eyebrow>
            <h2 className="h-section mt-5">A process built to grow your business.</h2>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="t-body">Every step has one job: put your business in front of more customers.</p>
          </Reveal>
        </div>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PROCESS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className="border-t border-ink pt-5">
              <span className="font-serif text-[4.5rem] leading-none text-accent">{s.n}</span>
              <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
              <p className="t-body mt-2">{s.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
