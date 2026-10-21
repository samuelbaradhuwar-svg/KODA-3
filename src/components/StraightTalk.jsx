import React from "react";
import { STRAIGHT_TALK } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";

// A short, honest strip: nobody can promise a number one ranking, and what we do promise.
export default function StraightTalk() {
  return (
    <section aria-label="Straight talk" className="keep-light bg-ink py-16 text-paper sm:py-20 lg:py-24">
      <div className="wrap">
        <Reveal>
          <Eyebrow light>Straight talk</Eyebrow>
          <Headline light as="h2" className="h-section mt-5 max-w-[22ch]">
            Nobody can promise you the number one spot on Google.
          </Headline>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-paper/70">
            Not us, and not anyone else. What we can promise is a website built properly, a written quote that confirms exactly what is included, and people who answer when you get in touch.
          </p>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {STRAIGHT_TALK.map((t, i) => (
            <Reveal as="li" key={t.title} delay={i * 80} className="rounded-3xl bg-paper/[0.07] p-6 sm:p-7">
              <h3 className="xwide text-[0.95rem] uppercase leading-[1.1] tracking-[-0.01em] text-accent">{t.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-paper/75">{t.desc}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
