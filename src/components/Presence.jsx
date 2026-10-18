import React from "react";
import { PRESENCE } from "../content.js";
import { Button, Eyebrow, Headline, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

export default function Presence() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="text-center">
          <Reveal>
            <div className="flex justify-center"><Eyebrow>Why a digital presence matters</Eyebrow></div>
            <Headline className="h-section mx-auto mt-5 max-w-[22ch]">
              Customers look you up <em>before</em> they call you.
            </Headline>
            <p className="t-body mx-auto mt-6 text-base">
              Today, people check a business on Google, then on its website, before they pick up the phone. A professional email address, a Google Workspace set up around your business name and a complete Google presence tell them you are real, reliable and ready to help. Without them, they move on to someone who does.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {PRESENCE.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="border-t border-ink/15 py-6">
                <h3 className="font-display text-[1.25rem] leading-[1.1]">{p.title}</h3>
                <p className="t-body mx-auto mt-2.5">{p.desc}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-10 flex justify-center">
            <Button onClick={() => scrollToId("contact")}>Get your business set up</Button>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
