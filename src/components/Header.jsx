import React, { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { NAV_LINKS } from "../content.js";
import { Logo } from "./ui.jsx";
import { cn, scrollToId } from "../lib/utils.js";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // While the mobile menu is open: lock page scroll, make the page behind it inert, close on Escape,
  // and close it if the window grows to the desktop layout.
  useEffect(() => {
    if (!open) return;
    const behind = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean);
    behind.forEach((el) => el.setAttribute("inert", ""));
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && close(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = (returnFocus) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  const onNav = (e, id) => {
    // On a page that has the section, scroll smoothly. Otherwise follow the /#id link to the home page.
    if (document.getElementById(id)) {
      e.preventDefault();
      setOpen(false);
      scrollToId(id);
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || open ? "border-b border-ink/10 bg-paper/95 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <div className="wrap flex h-16 items-center justify-between lg:h-[4.5rem]">
        <a href="/" aria-label="KODA home" className="relative z-50 inline-flex min-h-11 items-center">
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={(e) => onNav(e, l.id)}
              aria-current={active === l.id ? "location" : undefined}
              className={cn(
                "relative text-sm transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100",
                active === l.id ? "text-ink after:scale-x-100" : "text-muted"
              )}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#contact"
            onClick={(e) => onNav(e, "contact")}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-[background,transform] duration-300 hover:bg-accentDeep active:scale-[0.98]"
          >
            Book a call
          </a>
        </nav>

        <button
          ref={toggleRef}
          className="relative z-50 grid h-11 w-11 place-items-center rounded-full border border-ink/15 lg:hidden"
          onClick={() => (open ? close(true) : setOpen(true))}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-paper pt-24 transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="wrap flex flex-col">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={(e) => onNav(e, l.id)}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              className={cn(
                "border-b border-ink/10 py-5 text-left font-serif text-4xl transition-[opacity,transform] duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              )}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#contact"
            onClick={(e) => onNav(e, "contact")}
            className="mt-8 rounded-full bg-ink px-6 py-4 text-center text-sm font-medium text-paper active:scale-[0.98]"
          >
            Book a free consultation
          </a>
        </nav>
      </div>
    </header>
  );
}
