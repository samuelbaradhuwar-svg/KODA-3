// The browser build. Sections far below the first screen are separate files that load, and start up, only when the
// visitor is within a couple of screens of them. Until then the pre-rendered HTML stays in place, so nothing is blank.
// (The server build uses sections.ssr.js, which imports everything normally so the pre-rendered HTML is complete.)
import { lazy } from "react";
import { whenNear } from "./lib/near.js";

const near = (id, load) => lazy(() => whenNear(id).then(load));

export const Work = near("portfolio", () => import("./components/Work.jsx"));
export const Services = near("services", () => import("./components/Services.jsx"));
export const Process = near("process", () => import("./components/Process.jsx"));
export const About = near("about", () => import("./components/About.jsx"));
export const Pricing = near("pricing", () => import("./components/Pricing.jsx"));
export const Compare = near("compare", () => import("./components/Compare.jsx"));
export const StraightTalk = near("straight-talk", () => import("./components/StraightTalk.jsx"));
export const Testimonials = near("testimonials", () => import("./components/Testimonials.jsx"));
export const Faq = near("faq", () => import("./components/Faq.jsx"));
export const Audit = near("audit", () => import("./components/Audit.jsx"));
export const Contact = near("contact", () => import("./components/Contact.jsx"));
export const Footer = near("site-footer", () => import("./components/Footer.jsx"));

// Pages other than the home page load their own file when they are the page being shown.
export const WebsiteDesignDurban = lazy(() => import("./pages/WebsiteDesignDurban.jsx"));
export const PrivacyPolicy = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.PrivacyPolicy })));
export const Terms = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.Terms })));
export const RefundPolicy = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.RefundPolicy })));
export const CookiePolicy = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.CookiePolicy })));
