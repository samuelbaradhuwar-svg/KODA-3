import React from "react";
import Pricing from "../components/Pricing.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";

// A page of its own for the plans, so it can be linked to and found. It shows the same plans as the home page.
export default function PricingPage() {
  return (
    <main id="main">
      <Pricing page />
      <div className="bg-paper2">
        <Faq title="Questions about pricing and plans" />
      </div>
      <Contact />
    </main>
  );
}
