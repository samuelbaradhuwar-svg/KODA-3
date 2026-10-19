import React, { useEffect } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import { Ticker, Proof } from "./components/Ticker.jsx";
import Presence from "./components/Presence.jsx";
import Work from "./components/Work.jsx";
import Services from "./components/Services.jsx";
import Process from "./components/Process.jsx";
import About from "./components/About.jsx";
import Pricing from "./components/Pricing.jsx";
import Compare from "./components/Compare.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Faq from "./components/Faq.jsx";
import Audit from "./components/Audit.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import WhatsApp from "./components/WhatsApp.jsx";
import BackToTop from "./components/BackToTop.jsx";
import WebsiteDesignDurban from "./pages/WebsiteDesignDurban.jsx";
import { PrivacyPolicy, Terms, RefundPolicy, CookiePolicy } from "./pages/Legal.jsx";
import { PAGES } from "./content.js";
import { scrollToId } from "./lib/utils.js";

export { PAGES };

function Home() {
  return (
    <main id="main">
      <Hero />
      <Ticker />
      <Proof />
      <Presence />
      <Work />
      <Services />
      <Process />
      <About />
      <Pricing />
      <Compare />
      <Testimonials />
      <Faq />
      <Audit />
      <Contact />
    </main>
  );
}

export default function App({ path = "/" }) {
  useEffect(() => {
    // Pages that link to "/#section" land here, so scroll to the section once the page has rendered.
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => scrollToId(id), 50);
  }, []);

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
        <WebsiteDesignDurban />
      ) : path === "/privacy-policy" ? (
        <PrivacyPolicy />
      ) : path === "/terms" ? (
        <Terms />
      ) : path === "/refund-policy" ? (
        <RefundPolicy />
      ) : path === "/cookie-policy" ? (
        <CookiePolicy />
      ) : (
        <Home />
      )}
      <Footer />
      <WhatsApp />
      <BackToTop />
    </div>
  );
}
