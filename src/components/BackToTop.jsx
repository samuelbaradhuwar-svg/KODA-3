import React, { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import { PHONE, cn } from "../lib/utils.js";
import { smoothScrollTo } from "../lib/smooth.js";

// Phones only: appears once the visitor has scrolled past the intro and takes them back to the top.
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const home = document.getElementById("home");
      const limit = home ? home.offsetTop + home.offsetHeight : window.innerHeight * 1.5;
      setShow(window.scrollY > limit);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) window.scrollTo({ top: 0, behavior: "auto" });
    else smoothScrollTo(0);
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn(
        "totop fixed z-40 grid h-12 w-12 place-items-center rounded-full bg-accent text-ink shadow-[0_14px_30px_-12px_rgba(16,16,16,0.55)] ring-1 ring-ink/15 transition-[transform,opacity,visibility] duration-300 active:scale-[0.94] [@media(min-width:768px)_and_(hover:hover)]:hidden",
        PHONE.whatsapp && PHONE.digits && "totop-lifted",
        show ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
      )}
    >
      <ArrowUp size={22} weight="bold" />
    </button>
  );
}
