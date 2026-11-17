import React from "react";
import { BUSINESS } from "../content.js";
import { Button, Eyebrow, Headline, Reveal } from "../components/ui.jsx";
import { PHONE } from "../lib/utils.js";

// Shown for any address that is not a page on this site. The pre-render step also writes it to 404.html, which the
// host serves (with a 404 status) for unknown addresses.
const LINKS = [
  { label: "Pricing", href: "/pricing", note: "Plans and prices in rand" },
  { label: "Our work", href: "/our-work", note: "Websites we have built" },
  { label: "Website developers in Durban", href: "/website-developers-in-durban", note: "What we build and how it works" },
  { label: "Online stores", href: "/ecommerce", note: "Ecommerce website design" },
  { label: "About the studio", href: "/about", note: "Who you deal with" },
  { label: "Free website audit", href: "/#audit", note: "Check your website in plain English" },
];

export default function NotFound() {
  return (
    <main id="main">
      <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <Reveal>
              <Eyebrow>Error 404</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Headline as="h1" className="h-display mt-6">
                That page <em>does not</em> exist.
              </Headline>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-7 max-w-[56ch] text-base">
                The link may be old, or there may be a typo in the address. Nothing is wrong on your side. Here is where you might want to go instead.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button href="/">Back to the home page</Button>
              <a href="/#contact" className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-ink/60">
                <span className="border-b border-ink/40 pb-0.5">Contact us</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec bg-paper2">
        <div className="wrap">
          <Reveal>
            <Headline className="h-section mb-12 max-w-[18ch]">Popular pages</Headline>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LINKS.map((l, i) => (
              <Reveal as="li" key={l.href} delay={i * 60} className="list-none">
                <a href={l.href} className="block h-full rounded-3xl border border-ink/15 bg-paper p-6 transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="xwide block text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{l.label}</span>
                  <span className="t-body mt-2 block">{l.note}</span>
                </a>
              </Reveal>
            ))}
          </ul>
          <p className="t-body mt-10 max-w-[62ch]">
            Still stuck? Email us on <a className="underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            {PHONE.digits ? <> or call <a className="underline underline-offset-4" href={`tel:+${PHONE.digits}`}>{PHONE.display}</a></> : null}, and tell us what you were looking for.
          </p>
        </div>
      </section>
    </main>
  );
}
