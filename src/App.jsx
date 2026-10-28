import React, { Suspense, useEffect } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import { Ticker, Proof } from "./components/Ticker.jsx";
import Presence from "./components/Presence.jsx";
import WhatsApp from "./components/WhatsApp.jsx";
import BackToTop from "./components/BackToTop.jsx";
import { PAGES } from "./content.js";
// The browser and the server build load these differently (see sections.client.js and sections.ssr.js).
import { Work, Services, Process, About, Pricing, Compare, StraightTalk, Testimonials, Faq, Audit, Contact, Footer, WebsiteDesignDurban, PrivacyPolicy, Terms, RefundPolicy, CookiePolicy } from "#sections";
import { scrollToId } from "./lib/utils.js";

export { PAGES };

function Home() {
  return (
    <main id="main">
      <Hero />
      <Ticker />
      <Proof />
      <Presence />
      <Suspense fallback={null}><Work /></Suspense>
      <Suspense fallback={null}><Services /></Suspense>
      <Suspense fallback={null}><Process /></Suspense>
      <Suspense fallback={null}><About /></Suspense>
      <Suspense fallback={null}><Pricing /></Suspense>
      <Suspense fallback={null}><Compare /></Suspense>
      <Suspense fallback={null}><StraightTalk /></Suspense>
      <Suspense fallback={null}><Testimonials /></Suspense>
      <Suspense fallback={null}><Faq /></Suspense>
      <Suspense fallback={null}><Audit /></Suspense>
      <Suspense fallback={null}><Contact /></Suspense>
    </main>
  );
}

export default function App({ path = "/" }) {
  useEffect(() => {
    // Pages that link to "/#section" land here, so scroll to the section once the page has rendered.
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => scrollToId(id), 50);
  }, []);

  // Pulling the page past the bottom (iOS rubber band) shows the colour of the <html> element. Near the bottom it takes
  // the footer's colour, so the footer seems to carry on; everywhere else it keeps the page colour.
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const footer = document.querySelector("footer");
      const nearBottom = window.scrollY + window.innerHeight >= root.scrollHeight - 120;
      root.style.backgroundColor = nearBottom && footer ? getComputedStyle(footer).backgroundColor : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.backgroundColor = "";
    };
  }, [path]);

  return (
    <div className="overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>
      <Header />
      {path === "/website-design-durban" ? (
        <Suspense fallback={null}><WebsiteDesignDurban /></Suspense>
      ) : path === "/privacy-policy" ? (
        <Suspense fallback={null}><PrivacyPolicy /></Suspense>
      ) : path === "/terms" ? (
        <Suspense fallback={null}><Terms /></Suspense>
      ) : path === "/refund-policy" ? (
        <Suspense fallback={null}><RefundPolicy /></Suspense>
      ) : path === "/cookie-policy" ? (
        <Suspense fallback={null}><CookiePolicy /></Suspense>
      ) : (
        <Home />
      )}
      <Suspense fallback={null}><Footer /></Suspense>
      <WhatsApp />
      <BackToTop />
    </div>
  );
}
