import React, { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../content.js";
import { Logo } from "./ui.jsx";
import { cn, scrollToId } from "../lib/utils.js";

// Logo on the left, burger on the right, always in dark ink. Over the opening hero each sits on a small frosted
// pill, so it stays readable on the black and white pool. Once the hero has scrolled away the bar becomes a solid
// paper strip, so the logo and burger never sit on top of page text. The links live in a glass panel that opens
// from the burger.
export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [solid, setSolid] = useState(false);
  const toggleRef = useRef(null);

  // Solid bar once the hero is behind us (and always on pages that have no hero).
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const hero = document.getElementById("home");
      setSolid(!hero || hero.getBoundingClientRect().bottom < 80);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Highlight the link for the section crossing the middle of the screen, and none while the hero is showing.
  useEffect(() => {
    const ids = ["home", ...NAV_LINKS.map((l) => l.id)];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === "home" ? "" : e.target.id)),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Escape closes the menu and hands focus back to the burger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onNav = (e, id) => {
    // On a page that has the section, scroll smoothly. Otherwise follow the /#id link to the home page.
    if (document.getElementById(id)) {
      e.preventDefault();
      setOpen(false);
      scrollToId(id);
    }
  };

  const onLogo = (e) => {
    setOpen(false);
    if (window.location.pathname.replace(/\/+$/, "") === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "safe-x fixed inset-x-0 top-0 z-50 flex items-center justify-between pb-3 pt-[calc(var(--sat)+0.75rem)] transition-colors duration-300 sm:pb-4 sm:pt-[calc(var(--sat)+1rem)]",
          "text-ink",
          solid ? "border-b border-ink/10 bg-paper/90 backdrop-blur-md" : "pointer-events-none border-b border-transparent"
        )}
      >
        <a
          href="/"
          aria-label="KODA home"
          onClick={onLogo}
          className={cn("pointer-events-auto inline-flex min-h-11 items-center rounded-full px-3 transition-colors duration-300", !solid && "bg-paper/80 ring-1 ring-ink/10 backdrop-blur-md")}
        >
          <Logo />
        </a>
        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
          className={cn("pointer-events-auto grid h-11 w-11 place-items-center rounded-full border transition-transform active:scale-95", solid ? "border-ink/40" : "border-ink/30 bg-paper/80 backdrop-blur-md")}
        >
          <span className="relative block h-[10px] w-[18px]">
            <span className={cn("absolute left-0 top-0 h-[1.5px] w-full bg-current transition-transform duration-300", open && "translate-y-[4.25px] rotate-45")} />
            <span className={cn("absolute bottom-0 left-0 h-[1.5px] w-full bg-current transition-transform duration-300", open && "-translate-y-[4.25px] -rotate-45")} />
          </span>
        </button>
      </header>

      {/* click-away layer + the menu */}
      <div className={cn("fixed inset-0 z-40", !open && "pointer-events-none")} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        id="site-menu"
        role="dialog"
        aria-label="Site menu"
        inert={!open}
        className={cn(
          "glass menu-panel fixed z-50 origin-top-right overflow-y-auto overscroll-contain text-ink transition-[opacity,transform,visibility] duration-300 ease-out sm:w-[360px]",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.96] opacity-0"
        )}
      >
        <nav aria-label="Primary" className="flex flex-col px-5 pb-2 pt-3 sm:px-6">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={(e) => onNav(e, l.id)}
              aria-current={active === l.id ? "location" : undefined}
              className={cn(
                "flex items-center justify-between border-b border-ink/10 py-4 font-display text-[1.9rem] leading-none transition-colors last:border-b-0 [@media(max-height:520px)]:py-2.5 [@media(max-height:520px)]:text-[1.4rem]",
                active === l.id ? "text-ink" : "text-ink/55 hover:text-ink"
              )}
            >
              {l.label}
              <span aria-hidden="true" className={cn("font-sans text-[15px] transition-transform", active === l.id ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-40")}>
                →
              </span>
            </a>
          ))}
        </nav>
        <div className="px-5 pb-5 pt-2 sm:px-6">
          <a
            href="/#contact"
            onClick={(e) => onNav(e, "contact")}
            className="grid h-12 place-items-center rounded-full bg-ink text-sm font-medium text-paper transition-[background,transform] duration-300 hover:bg-ink2 active:scale-[0.98]"
          >
            Book a call
          </a>
        </div>
      </div>
    </>
  );
}
