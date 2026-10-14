import React from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { PROJECTS } from "../content.js";
import { BrowserFrame, Button, Eyebrow, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6 xl:col-span-6">
          <Reveal>
            <Eyebrow>Web design studio, Durban</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="h-display mt-6">
              Your business deserves to be <em className="text-accent">found.</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="t-body mt-7 max-w-[46ch] text-base">
              KODA is a Durban web design studio. We build modern websites, set up and optimise your Google Business profile, and help local businesses turn online visibility into real customers.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
            <button onClick={() => scrollToId("portfolio")} className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink">
              <span className="border-b border-ink/40 pb-0.5 transition-colors group-hover:border-accentDeep group-hover:text-accentDeep">See our work</span>
              <ArrowDown size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative lg:col-span-6">
          <div className="relative mx-auto h-[19rem] max-w-[34rem] sm:h-[25rem] lg:h-[31rem] lg:max-w-none">
            <div className="absolute inset-x-0 top-0 w-[88%] animate-float sm:w-[84%]" style={{ rotate: "-1.5deg" }}>
              <BrowserFrame project={PROJECTS[0]} priority high />
            </div>
            <div className="absolute bottom-0 right-0 w-[64%] animate-float-slow sm:w-[58%]" style={{ rotate: "2deg" }}>
              <BrowserFrame project={PROJECTS[1]} priority />
            </div>
            <div className="absolute -left-1 bottom-6 flex items-center gap-2.5 rounded-full bg-paper px-4 py-2.5 shadow-[0_18px_40px_-18px_rgba(60,40,10,0.5)] ring-1 ring-ink/10 sm:left-2 sm:bottom-10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping2 rounded-full bg-accent" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">Live sites</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
