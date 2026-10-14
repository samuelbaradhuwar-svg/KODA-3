import React, { useEffect } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import { Ticker, Proof } from "./components/Ticker.jsx";
import Pillars from "./components/Pillars.jsx";
import Work from "./components/Work.jsx";
import Services from "./components/Services.jsx";
import Process from "./components/Process.jsx";
import About from "./components/About.jsx";
import Pricing from "./components/Pricing.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Faq from "./components/Faq.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import WhatsApp from "./components/WhatsApp.jsx";
import WebsiteDesignDurban from "./pages/WebsiteDesignDurban.jsx";
import { PAGES } from "./content.js";
import { scrollToId } from "./lib/utils.js";

export { PAGES };

function Home() {
  return (
    <main>
      <Hero />
      <Ticker />
      <Proof />
      <Pillars />
      <Work />
      <Services />
      <Process />
      <About />
      <Pricing />
      <Testimonials />
      <Faq />
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
      <Header />
      {path === "/website-design-durban" ? <WebsiteDesignDurban /> : <Home />}
      <Footer />
      <WhatsApp />
    </div>
  );
}
