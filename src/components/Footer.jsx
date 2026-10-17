import React from "react";
import { FacebookLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react";
import { NAV_LINKS, SOCIALS } from "../content.js";
import { Logo } from "./ui.jsx";
import { LETTER_PATHS } from "../lib/logo-paths.js";
import { EMAIL, openGmailCompose, scrollToId } from "../lib/utils.js";

const ICONS = { Instagram: InstagramLogo, Facebook: FacebookLogo, LinkedIn: LinkedinLogo };

export default function Footer() {
  const socials = SOCIALS.filter((s) => s.url);
  return (
    <footer className="bg-ink text-paper">
      <div className="wrap border-t border-paper/15 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo light />
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.7] text-paper/60">Web design studio in Durban, South Africa. Websites and Google Business profiles for local businesses.</p>
          </div>
          <nav aria-label="Footer" className="grid content-start gap-x-6 sm:grid-cols-2 lg:col-span-4 lg:col-start-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`/#${l.id}`}
                onClick={(e) => {
                  if (document.getElementById(l.id)) {
                    e.preventDefault();
                    scrollToId(l.id);
                  }
                }}
                className="inline-flex min-h-11 w-fit items-center text-sm text-paper/70 transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            ))}
            <a href="/website-design-durban" className="inline-flex min-h-11 w-fit items-center text-sm text-paper/70 transition-colors hover:text-accent">Website design Durban</a>
          </nav>
          <div className="lg:col-span-2">
            <a href={`mailto:${EMAIL}`} onClick={openGmailCompose} className="inline-flex min-h-11 items-center break-all text-sm text-paper/70 transition-colors hover:text-accent">{EMAIL}</a>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2.5">
                {socials.map((s) => {
                  const Icon = ICONS[s.label];
                  return (
                    <a key={s.label} href={s.url} aria-label={s.label} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-paper hover:text-accent">
                      <Icon size={17} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* the wordmark, drawn from the same traced letters as the hero lockup */}
        <svg viewBox="-483 380 961 160" aria-hidden="true" className="mt-16 w-full text-paper/[0.07]">
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} fill="currentColor" fillRule="evenodd" />
          ))}
        </svg>
        <p className="mt-10 border-t border-paper/10 pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/60">
          &copy; {new Date().getFullYear()} KODA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
