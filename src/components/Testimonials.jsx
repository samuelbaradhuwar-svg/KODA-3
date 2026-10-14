import React from "react";
import { TESTIMONIALS } from "../content.js";
import { Eyebrow, Reveal } from "./ui.jsx";

const initials = (name) => name.replace("Dr. ", "").split(" ").map((n) => n[0]).slice(0, 2).join("");

export default function Testimonials() {
  const [lead, ...rest] = TESTIMONIALS;
  return (
    <section className="sec bg-paper2">
      <div className="wrap">
        <Reveal>
          <Eyebrow>Client stories</Eyebrow>
          <h2 className="h-section mt-5 max-w-[16ch]">Trusted by business owners like you.</h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal as="figure" className="lg:col-span-7">
            <blockquote className="font-serif text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.15]">&ldquo;{lead.text}&rdquo;</blockquote>
            <Attribution t={lead} large />
          </Reveal>
          <div className="grid gap-x-8 lg:col-span-5 lg:col-start-8">
            {rest.map((t, i) => (
              <Reveal as="figure" key={t.name} delay={(i + 1) * 90} className="border-t border-ink/15 py-8 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-8">
                <blockquote className="text-[15px] leading-[1.75] text-ink/80">&ldquo;{t.text}&rdquo;</blockquote>
                <Attribution t={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Attribution({ t, large }) {
  return (
    <figcaption className={`flex items-center gap-3.5 ${large ? "mt-8" : "mt-5"}`}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-ink font-mono text-xs text-paper">{initials(t.name)}</span>
      <span>
        <span className="block text-sm font-medium">{t.name}</span>
        <span className="block text-sm text-muted">
          {t.role}, {t.city}
        </span>
      </span>
    </figcaption>
  );
}
