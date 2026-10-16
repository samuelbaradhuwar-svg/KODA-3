import React from "react";
import { PRESENCE } from "../content.js";
import PresenceArt from "./PresenceArt.jsx";
import { Button, Eyebrow, Headline, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

export default function Presence() {
  return (
    <section className="sec">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow>Why a digital presence matters</Eyebrow>
            <Headline className="h-section mt-5">
              Customers look you up <em>before</em> they call you.
            </Headline>
            <p className="t-body mt-6 text-base">
              Today, people check a business on Google, then on its website, before they pick up the phone. A professional email address, a Google Workspace set up around your business name and a complete Google presence tell them you are real, reliable and ready to help. Without them, they move on to someone who does.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {PRESENCE.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="border-t border-ink/15 py-6">
                <span className="text-xs font-semibold tracking-[0.14em] text-muted">0{i + 1} / 0{PRESENCE.length}</span>
                <h3 className="mt-3 font-display text-[1.7rem] leading-[1.05]">{p.title}</h3>
                <p className="t-body mt-2.5">{p.desc}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-8">
            <Button onClick={() => scrollToId("contact")}>Get your business set up</Button>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-5">
          <div className="sticky top-28 rounded-[28px] bg-paper2 p-7 sm:p-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">One business name, everything connected</p>
            <div className="mt-6 pb-4">
              <PresenceArt />
            </div>

            <div className="mt-6 border-t border-ink/15 pt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Which one would you trust?</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-ink/15 px-4 py-3.5 text-muted">
                  <p className="break-all font-mono text-[13px]">yourname123@gmail.com</p>
                  <p className="mt-1 text-xs">Looks like a hobby</p>
                </div>
                <div className="rounded-2xl bg-ink px-4 py-3.5 text-paper shadow-[0_20px_34px_-22px_rgba(10,10,11,0.6)]">
                  <p className="break-all font-mono text-[13px]">hello@yourbusiness.co.za</p>
                  <p className="mt-1 text-xs text-paper/70">Looks like a business</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted">
              We set up your Google Workspace and business email, your Google Business profile and your website, so the first impression is the right one.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
