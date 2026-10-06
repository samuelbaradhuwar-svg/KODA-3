import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Car,
  ChevronDown,
  Clock3,
  Flower2,
  Fuel,
  Globe,
  LayoutTemplate,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  PenTool,
  Phone,
  RefreshCcw,
  Rocket,
  Scissors,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Smile,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import KODA_ICON_BLACK from "./assets/koda-icon-black.webp";
import KODA_ICON_WHITE from "./assets/koda-icon-white.webp";
import PHOTO_BARBER from "./assets/photo-barber.webp";
import PHOTO_DENTAL from "./assets/photo-dental.webp";
import PHOTO_CAR from "./assets/photo-car.webp";

/* lucide-react no longer ships brand icons, so these are local copies of the old ones. */
function makeIcon(children) {
  return function Icon({ className, fill = "none", strokeWidth = 2 }) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    );
  };
}
const Facebook = makeIcon(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />);
const Instagram = makeIcon(
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>
);
const Linkedin = makeIcon(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>
);


/* ===== data/content.js ===== */
const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "Services", id: "services" },
  { label: "Portfolio", id: "portfolio" },
  { label: "Pricing", id: "pricing" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

const SERVICES = [
  { icon: LayoutTemplate, title: "Website Design", desc: "Professional websites built around how your customers search, browse and buy, with WhatsApp and Google Maps built in." },
  { icon: RefreshCcw, title: "Website Redesign", desc: "A modern rebuild of your existing site, keeping your business the same while delivering faster load times, sharper design and better results." },
  { icon: ShoppingCart, title: "Ecommerce Stores", desc: "Fully functional online stores with secure checkout, inventory management and shopping flows designed for mobile." },
  { icon: CalendarCheck, title: "Booking Systems", desc: "Let customers book appointments, tables or services online, 24/7, without a single phone call." },
  { icon: MapPin, title: "Google Business Profile", desc: "A fully optimised profile so your business shows up on Google Search and Maps when local customers look for you." },
  { icon: TrendingUp, title: "SEO Optimisation", desc: "On page and technical SEO that helps your website rank higher and get found by people ready to buy." },
  { icon: Wrench, title: "Website Maintenance", desc: "Ongoing updates, backups and security monitoring so your site stays fast, safe and always online." },
  { icon: Mail, title: "Business Email Setup", desc: "Professional @yourbusiness email addresses that build instant credibility with every message you send." },
];

const WHY_US = [
  { icon: Zap, title: "Lightning Fast Websites", desc: "Built for speed, so visitors never leave before your site even loads." },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Designed for phones first, because most of your customers are on them." },
  { icon: ShieldCheck, title: "Secure Hosting", desc: "SSL, backups and monitoring included, so your site stays online and protected." },
  { icon: Clock3, title: "Fast Turnaround", desc: "Most projects launch in days, not months, without cutting corners." },
];

const PORTFOLIO = [
  {
    name: "The Cut Room",
    category: "Barbershop",
    brand: "THE CUT ROOM",
    nav: ["Home", "Services", "Gallery", "Contact"],
    headline: ["Premium cuts.", "Local roots."],
    sub: "Modern barbering for men who value quality, style and precision.",
    cta: "Book Now",
    icon: Scissors,
    tag: "Website + Google Business",
    image: PHOTO_BARBER,
    stats: [["10+", "Years Experience"], ["5\u2605", "Rated on Google"], ["500+", "Happy Clients"]],
    colors: { bg: "#0D0F14", fg: "#FFFFFF", muted: "rgba(255,255,255,0.66)", line: "rgba(255,255,255,0.09)", btnBg: "#FFFFFF", btnFg: "#0D0F14", artA: "#5B5F6B", artB: "#0D0F14", iconColor: "#FFFFFF" },
  },
  {
    name: "SmileCare Dental Clinic",
    category: "Dental Practice",
    brand: "SmileCare",
    nav: ["Home", "About", "Services", "Contact"],
    headline: ["Healthy smiles.", "Brighter futures."],
    sub: "Modern dental care for the whole family.",
    cta: "Book Appointment",
    icon: Smile,
    tag: "Website + Online Booking",
    image: PHOTO_DENTAL,
    colors: { bg: "#F4F7FB", fg: "#0F172A", muted: "#64748B", line: "rgba(15,23,42,0.08)", btnBg: "#2563EB", btnFg: "#FFFFFF", artA: "#93C5FD", artB: "#EFF6FF", iconColor: "#1D4ED8" },
  },
  {
    name: "Auto Zone",
    category: "Car Dealership",
    brand: "AUTO ZONE",
    nav: ["Home", "Stock", "Finance", "Contact"],
    headline: ["Quality vehicles.", "Trusted service."],
    sub: "Used cars, great value and local support.",
    cta: "View Stock",
    icon: Car,
    tag: "Website + SEO",
    image: PHOTO_CAR,
    colors: { bg: "#0B0E13", fg: "#FFFFFF", muted: "rgba(255,255,255,0.66)", line: "rgba(255,255,255,0.09)", btnBg: "#FFFFFF", btnFg: "#0B0E13", artA: "#6B7280", artB: "#0B0E13", iconColor: "#FFFFFF" },
  },
];

const PLANS = [
  {
    name: "Starter",
    was: "R3,499",
    price: "R2,499",
    note: "once off",
    desc: "A polished single page presence for businesses just getting online.",
    features: ["One page website", "WhatsApp button and contact form", "Google Maps integration", "Basic SEO setup"],
    highlighted: false,
  },
  {
    name: "Business",
    price: "R5,999",
    note: "once off",
    desc: "A complete website with several pages, built to win trust and generate leads.",
    features: ["Everything in Starter", "Five page website", "Photo gallery and testimonials", "On page SEO", "Google indexing setup"],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "From R9,999",
    note: "custom quote",
    desc: "For businesses that sell or book online and need a site to match.",
    features: ["Everything in Business", "Booking system", "Ecommerce store", "Advanced SEO", "Custom integrations and priority support"],
    highlighted: false,
  },
];

const TESTIMONIALS = [
  { name: "Thandiwe Nkosi", role: "Owner, Ember & Oak Bistro", city: "Cape Town", text: "Bookings went up almost immediately. The site loads fast, looks incredible on mobile and customers actually compliment it." },
  { name: "Dr. Kevin Petersen", role: "Riverside Medical Practice", city: "Johannesburg", text: "Our front desk used to be buried in phone calls. Now most patients just book online. KODA nailed the brief." },
  { name: "Marius van der Berg", role: "Site & Steel Builders", city: "Pretoria", text: "Professional from the first call to launch day. The gallery alone has brought us three new contracts this month." },
];

const FAQS = [
  { q: "How long does a website take?", a: "Most single page sites launch within five to seven working days. Websites with multiple pages, or those with a booking system or ecommerce store, typically take two to four weeks, depending on content and revisions." },
  { q: "Do you provide hosting?", a: "Yes. Every website we build includes secure, managed hosting with SSL, backups and uptime monitoring, so you never have to think about the technical side." },
  { q: "Can I update my website?", a: "Absolutely. We build every site with a simple content editor so you can update text, images and offers yourself, and we're always on hand if you'd rather we do it." },
  { q: "Do you provide support?", a: "Yes. Every plan includes support after launch, and our maintenance service covers ongoing updates, security monitoring and small changes for a flat monthly fee." },
  { q: "Do I need to know anything technical to get started?", a: "No. We handle the strategy, design, build and setup from start to finish. All we need from you is a short call about your business." },
];

const TRUSTED = [
  { name: "The Cut Room", sub: "Barbershop", icon: Scissors },
  { name: "SmileCare", sub: "Dental Clinic", icon: Smile },
  { name: "Auto Zone", sub: "Used Vehicles", icon: Car },
  { name: "Bloom", sub: "Florist & Gifts", icon: Flower2 },
  { name: "Local Fuel", sub: "Convenience", icon: Fuel },
];

const ADVANTAGE = [
  {
    kind: "website",
    tone: "blue",
    icon: Globe,
    title: "Website",
    desc: "A modern, mobile friendly website that showcases your business and builds credibility.",
  },
  {
    kind: "google",
    tone: "blue",
    icon: MapPin,
    title: "Google Business",
    desc: "Get found on Google Maps, show up in local searches and make it easy for customers to contact you.",
  },
  {
    kind: "social",
    tone: "green",
    icon: TrendingUp,
    title: "Digital presence",
    desc: "Consistent branding, social links, local SEO and ongoing support to help you grow long term.",
  },
];

const PROCESS = [
  {
    n: 1,
    icon: Search,
    title: "Discover",
    desc: "We learn about your business, what you offer and who your customers are.",
  },
  {
    n: 2,
    icon: PenTool,
    title: "Design",
    desc: "We build a professional website and set up your Google Business profile.",
  },
  {
    n: 3,
    icon: Rocket,
    title: "Launch",
    desc: "We take you live, so customers can find you on Google, Maps and social.",
  },
  {
    n: 4,
    icon: BarChart3,
    title: "Grow",
    desc: "We keep your website and online presence up to date so you stay easy to find.",
  },
];

const OUTCOMES = [
  {
    icon: Users,
    title: "More clients",
    desc: "A website and Google profile make it easy for customers to find you and get in touch.",
  },
  {
    icon: Megaphone,
    title: "More exposure",
    desc: "Be found on Google Maps, local search and social, right when customers are looking.",
  },
  {
    icon: Wallet,
    title: "More income",
    desc: "When more people find you and trust you, more of them become paying customers.",
  },
  {
    icon: TrendingUp,
    title: "More revenue",
    desc: "Your website works for you around the clock, so your business is always open to new customers.",
  },
];

/* ===== lib/utils.js ===== */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===== components/ui/Reveal.jsx ===== */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translate3d(0, 28px, 0)",
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/* ===== components/ui/Logo.jsx ===== */
function LogoMark({ className = "h-9 w-9", dark = true }) {
  return (
    <img
      src={dark ? KODA_ICON_WHITE : KODA_ICON_BLACK}
      alt="KODA logo mark"
      width={240}
      height={250}
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}

function Logo({ dark = true }) {
  return (
    <div className="flex select-none items-center gap-3">
      <LogoMark dark={dark} />
      <span
        className={`font-logo text-xl font-bold uppercase tracking-[-0.025em] ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        KODA
      </span>
    </div>
  );
}

/* ===== components/ui/Buttons.jsx ===== */
function PrimaryButton({ children, onClick, className = "", icon: Icon = ArrowRight }) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${className}`}
    >
      {children}
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  );
}

function SecondaryButton({ children, onClick, dark = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
        dark
          ? "border-white/15 text-white bg-white/[0.03] hover:bg-white/10 backdrop-blur"
          : "border-slate-200 text-slate-900 bg-white hover:bg-slate-50 hover:border-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ===== components/ui/Eyebrow.jsx ===== */
function Eyebrow({ children, dark = false, className = "" }) {
  return (
    <span
      className={`t-eyebrow ${dark ? "inv" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

/* ===== components/ui/Icons.jsx ===== */
function GoogleG({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// Bars with a rising arrow, used for the Digital presence card.
function GrowthIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 20v-5M11 20v-8M17 20v-11" />
      <path d="M4 10l5-4 3 2 7-5" />
      <path d="M15 3h4v4" />
    </svg>
  );
}

const CHECK_TONES = {
  solid: { bg: "#10B981", tick: "#FFFFFF" },
  soft: { bg: "rgba(16,185,129,0.14)", tick: "#059669" },
  softDark: { bg: "rgba(16,185,129,0.18)", tick: "#34D399" },
  blue: { bg: "#EFF6FF", tick: "#2563EB" },
  blueDark: { bg: "rgba(59,130,246,0.22)", tick: "#60A5FA" },
};

// A perfectly round badge with a centred, evenly stroked tick. Sizes are inline so they never drift.
function CheckBadge({ size = 20, tone = "solid", className = "" }) {
  const t = CHECK_TONES[tone] || CHECK_TONES.solid;
  const icon = Math.round(size * 0.6);
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: t.bg,
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke={t.tick} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12.8l4.2 4.2L18 8.2" />
      </svg>
    </span>
  );
}

/* ===== components/ui/AdvantageArt.jsx ===== */
/*
 * Vector artwork for the "From local business to local brand" cards.
 * Everything is drawn in SVG so it stays razor sharp on any screen.
 * Replace with real screenshots whenever you have them.
 */

function Art({ w, h = 104, height = 108, children }) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={(height * w) / h}
      height={height}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {children}
    </svg>
  );
}

function star(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function Shadow({ id }) {
  return (
    <filter id={id} x="-25%" y="-15%" width="150%" height="140%">
      <feDropShadow dx="0" dy="2.2" stdDeviation="2.4" floodColor="#0F172A" floodOpacity="0.2" />
    </filter>
  );
}

/* ---------- BEFORE: dull, grey, unfinished ---------- */
function BeforePhone({ kind = "list", height }) {
  return (
    <Art w={64} height={height}>
      <defs>
        <Shadow id={`bp-${kind}-sh`} />
      </defs>
      <rect x="3" y="2" width="58" height="100" rx="11" fill="#F3F4F6" />
      <g filter={`url(#bp-${kind}-sh)`}>
        <rect x="11" y="8" width="42" height="88" rx="8" fill="#FFFFFF" stroke="#CBD0D8" strokeWidth="1.2" />
      </g>
      <rect x="25" y="11" width="14" height="3.2" rx="1.6" fill="#D5D9DF" />

      {kind === "list" && (
        <g>
          <rect x="11.6" y="18" width="40.8" height="9" fill="#A3AAB5" />
          {[33, 47, 61, 75].map((y, i) => (
            <g key={y}>
              <circle cx="19" cy={y + 3} r="3.4" fill="#C8CDD5" />
              <rect x="26" y={y} width={i % 2 ? 22 : 18} height="2.6" rx="1.3" fill="#B2B8C2" />
              <rect x="26" y={y + 4.6} width="14" height="2" rx="1" fill="#E1E4E9" />
              <rect x="16" y={y + 9.6} width="32" height="0.8" fill="#EEF0F3" />
            </g>
          ))}
        </g>
      )}

      {kind === "listing" && (
        <g>
          <circle cx="17" cy="21" r="2.6" fill="#D0D4DA" />
          <rect x="22" y="19.4" width="15" height="3.2" rx="1.6" fill="#D0D4DA" />
          <rect x="44" y="19.4" width="7" height="3.2" rx="1.6" fill="#E1E4E9" />
          <rect x="14" y="27" width="36" height="21" rx="2" fill="#AEB3BD" />
          <path d="M14 48 L24 35 L30 42 L37 32 L50 48 Z" fill="#8F96A3" />
          <circle cx="42" cy="33" r="2.4" fill="#C9CDD4" />
          {[54, 67, 80].map((y) => (
            <g key={y}>
              <rect x="14" y={y} width="9" height="9" rx="2.2" fill="#E3E6EB" />
              <rect x="27" y={y + 1} width="20" height="2.6" rx="1.3" fill="#C7CCD4" />
              <rect x="27" y={y + 5.4} width="13" height="2" rx="1" fill="#E3E6EB" />
            </g>
          ))}
        </g>
      )}

      {kind === "feed" && (
        <g>
          <rect x="11.6" y="18" width="40.8" height="9" fill="#A3AAB5" />
          {[33, 64].map((y) => (
            <g key={y}>
              <circle cx="18" cy={y + 3} r="3" fill="#C8CDD5" />
              <rect x="24" y={y + 1} width="16" height="2.4" rx="1.2" fill="#B2B8C2" />
              <rect x="15" y={y + 8} width="34" height="16" rx="2" fill="#E1E4E9" />
              <rect x="15" y={y + 27} width="26" height="2" rx="1" fill="#D3D7DE" />
            </g>
          ))}
        </g>
      )}
      <rect x="27" y="91" width="10" height="1.8" rx="0.9" fill="#D5D9DF" />
    </Art>
  );
}

/* ---------- AFTER: Website ---------- */
function WebsiteAfter({ height }) {
  return (
    <Art w={86} height={height}>
      <defs>
        <Shadow id="wa-sh" />
        <clipPath id="wa-clip">
          <rect x="5" y="3" width="76" height="98" rx="9" />
        </clipPath>
        <linearGradient id="wa-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0D0F14" />
          <stop offset="0.55" stopColor="#0D0F14" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0D0F14" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wa-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.6" stopColor="#0D0F14" stopOpacity="0" />
          <stop offset="1" stopColor="#0D0F14" />
        </linearGradient>
      </defs>
      <g filter="url(#wa-sh)">
        <rect x="5" y="3" width="76" height="98" rx="9" fill="#0D0F14" />
      </g>
      <g clipPath="url(#wa-clip)">
        <image href={PHOTO_BARBER} x="30" y="3" width="56" height="64" preserveAspectRatio="xMidYMid slice" />
        <rect x="5" y="3" width="76" height="64" fill="url(#wa-fade)" />
        <rect x="5" y="3" width="76" height="64" fill="url(#wa-down)" />

        {/* nav */}
        <rect x="10" y="9" width="15" height="2.8" rx="1.4" fill="#FFFFFF" opacity="0.92" />
        {[8.4, 10.8, 13.2].map((y) => (
          <rect key={y} x="68" y={y} width="7" height="1.1" rx="0.55" fill="#FFFFFF" opacity="0.8" />
        ))}

        {/* headline */}
        <text x="10" y="27" fontSize="7.6" fontWeight="800" fill="#FFFFFF" letterSpacing="-0.35">Premium cuts.</text>
        <text x="10" y="35.6" fontSize="7.6" fontWeight="800" fill="#FFFFFF" letterSpacing="-0.35">Local roots.</text>
        <rect x="10" y="40.5" width="28" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.55" />
        <rect x="10" y="44" width="21" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.55" />

        {/* CTA */}
        <rect x="10" y="49" width="24" height="7.4" rx="3.7" fill="#FFFFFF" />
        <rect x="14.5" y="52" width="11" height="1.6" rx="0.8" fill="#0D0F14" />
        <path d="M28.6 52.8h3.2m-1.4-1.3l1.4 1.3-1.4 1.3" stroke="#0D0F14" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* stat cards */}
        {[10, 46].map((x, i) => (
          <g key={x}>
            <rect x={x} y="60.5" width="30" height="13" rx="3" fill="#171B23" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.6" />
            <text x={x + 4} y="68" fontSize="5.4" fontWeight="800" fill="#FFFFFF">{i ? "5\u2605" : "10+"}</text>
            <rect x={x + 4} y="70" width="16" height="1.3" rx="0.65" fill="#FFFFFF" opacity="0.5" />
          </g>
        ))}

        {/* light section */}
        <rect x="5" y="77" width="76" height="24" fill="#F8FAFC" />
        {[10, 46].map((x) => (
          <g key={x}>
            <rect x={x} y="81" width="30" height="15" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.7" />
            <rect x={x + 4} y="85" width="12" height="2.2" rx="1.1" fill="#0F172A" />
            <rect x={x + 4} y="89.4" width="20" height="1.4" rx="0.7" fill="#CBD5E1" />
          </g>
        ))}
      </g>
    </Art>
  );
}

/* ---------- AFTER: Google Business ---------- */
function GoogleAfter({ height }) {
  return (
    <Art w={86} height={height}>
      <defs>
        <Shadow id="ga-sh" />
        <Shadow id="ga-sh2" />
        <clipPath id="ga-clip">
          <rect x="5" y="3" width="76" height="98" rx="9" />
        </clipPath>
      </defs>
      <g filter="url(#ga-sh)">
        <rect x="5" y="3" width="76" height="98" rx="9" fill="#FFFFFF" />
      </g>
      <g clipPath="url(#ga-clip)">
        {/* map */}
        <rect x="5" y="3" width="76" height="46" fill="#EAF1E6" />
        <path d="M5 33 C 20 26, 32 40, 50 33 S 72 30, 81 35 L81 49 L5 49 Z" fill="#CFE4F5" />
        <rect x="14" y="8" width="16" height="9" rx="1.5" fill="#DCEBD4" />
        <rect x="54" y="38" width="20" height="8" rx="1.5" fill="#DCEBD4" />
        <path d="M5 40 L81 17" stroke="#FFFFFF" strokeWidth="4.2" />
        <path d="M30 3 L46 49" stroke="#FFFFFF" strokeWidth="3.6" />
        <path d="M60 3 L66 49" stroke="#FFFFFF" strokeWidth="2.4" />
        <path d="M17 49 L38 31 L60 21" stroke="#F7C948" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* search pill */}
        <g filter="url(#ga-sh2)">
          <rect x="10" y="8" width="44" height="9.5" rx="4.75" fill="#FFFFFF" />
        </g>
        <circle cx="16" cy="12.75" r="2.3" fill="#2563EB" />
        <rect x="21.5" y="11.6" width="22" height="2.3" rx="1.15" fill="#CBD5E1" />

        {/* pin */}
        <ellipse cx="63" cy="35.5" rx="4" ry="1.4" fill="#0F172A" opacity="0.18" />
        <path d="M63 35 C 56.6 28, 55.6 25.2, 55.6 22.4 a7.4 7.4 0 0 1 14.8 0 C 70.4 25.2, 69.4 28, 63 35 Z" fill="#EA4335" />
        <circle cx="63" cy="22.4" r="2.9" fill="#FFFFFF" />

        {/* business card */}
        <rect x="5" y="49" width="76" height="52" fill="#FFFFFF" />
        <rect x="10" y="54.5" width="40" height="3.6" rx="1.8" fill="#0F172A" />
        <text x="10" y="66.4" fontSize="5.6" fontWeight="700" fill="#0F172A">4.9</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon key={i} points={star(25 + i * 5.4, 64.6, 2.5)} fill="#FBBC04" />
        ))}
        <rect x="10" y="69.4" width="32" height="1.8" rx="0.9" fill="#CBD5E1" />
        <rect x="10" y="75.5" width="31" height="8.4" rx="4.2" fill="#2563EB" />
        <rect x="16.5" y="78.6" width="18" height="2.2" rx="1.1" fill="#FFFFFF" />
        <rect x="44" y="75.5" width="27" height="8.4" rx="4.2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        <rect x="49" y="78.6" width="17" height="2.2" rx="1.1" fill="#94A3B8" />
        <rect x="10" y="88" width="62" height="0.7" fill="#EEF1F5" />
        <circle cx="14.5" cy="94.2" r="3" fill="#CBD5E1" />
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon key={i} points={star(22.5 + i * 4.4, 92.6, 1.9)} fill="#FBBC04" />
        ))}
        <rect x="21" y="96" width="30" height="1.5" rx="0.75" fill="#E2E8F0" />
      </g>
    </Art>
  );
}

/* ---------- AFTER: Digital presence (social storefront) ---------- */
function SocialAfter({ height }) {
  const stripes = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Art w={86} height={height}>
      <defs>
        <Shadow id="sa-sh" />
        <clipPath id="sa-clip">
          <rect x="5" y="3" width="76" height="98" rx="9" />
        </clipPath>
        <linearGradient id="sa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B2230" />
          <stop offset="1" stopColor="#0E1219" />
        </linearGradient>
        <linearGradient id="sa-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7B0" />
          <stop offset="1" stopColor="#F2B04E" />
        </linearGradient>
      </defs>
      <g filter="url(#sa-sh)">
        <rect x="5" y="3" width="76" height="98" rx="9" fill="#0B0E13" />
      </g>
      <g clipPath="url(#sa-clip)">
        {/* post header */}
        <circle cx="15.5" cy="14" r="4.6" fill="#FFFFFF" />
        <circle cx="15.5" cy="14" r="2.1" fill="#0B0E13" />
        <rect x="23" y="10.6" width="24" height="2.8" rx="1.4" fill="#FFFFFF" />
        <rect x="23" y="15.2" width="15" height="1.8" rx="0.9" fill="#FFFFFF" opacity="0.45" />
        <circle cx="70" cy="14" r="0.9" fill="#FFFFFF" opacity="0.7" />
        <circle cx="73" cy="14" r="0.9" fill="#FFFFFF" opacity="0.7" />

        {/* storefront photo */}
        <rect x="5" y="23" width="76" height="52" fill="url(#sa-sky)" />
        <rect x="13" y="30" width="60" height="42" fill="#212938" />
        <rect x="21" y="26" width="44" height="8.6" rx="1.6" fill="#0B0E13" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="0.6" />
        <text x="43" y="32.5" fontSize="5.4" fontWeight="800" fill="#FFFFFF" textAnchor="middle" letterSpacing="1.1">BLOOM</text>
        {stripes.map((i) => (
          <path
            key={i}
            d={`M${19 + i * 6} 36.5 H${25 + i * 6} V45 A3 3 0 0 1 ${19 + i * 6} 45 Z`}
            fill={i % 2 ? "#2563EB" : "#F4F6F9"}
          />
        ))}
        <rect x="19" y="35.4" width="48" height="1.6" fill="#0B0E13" opacity="0.5" />
        {[19, 51].map((x) => (
          <g key={x}>
            <rect x={x} y="50" width="16" height="18" rx="1" fill="url(#sa-glow)" />
            <path d={`M${x + 8} 50 V68 M${x} 59 H${x + 16}`} stroke="#8A5A1C" strokeWidth="0.8" opacity="0.55" />
            <circle cx={x + 4} cy="66" r="2.2" fill="#3F8F5E" />
            <circle cx={x + 11} cy="66.4" r="2" fill="#D9738E" />
          </g>
        ))}
        <rect x="38" y="50" width="10" height="22" rx="1" fill="#0B0E13" />
        <rect x="39.4" y="51.4" width="7.2" height="14" rx="0.6" fill="#F2B04E" opacity="0.5" />
        <rect x="5" y="70" width="76" height="5" fill="#0E1219" />
        <ellipse cx="43" cy="71" rx="22" ry="1.8" fill="#F2B04E" opacity="0.22" />

        {/* actions + caption */}
        <path d="M12 82.2c-1.2-1.4-3.2-.6-3.2 1 0 1.4 1.8 2.6 3.2 3.8 1.4-1.2 3.2-2.4 3.2-3.8 0-1.6-2-2.4-3.2-1z" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <circle cx="22" cy="84" r="2.9" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <path d="M30.6 81.6l5.4 2.2-5.4 2.2 1.1-2.2z" fill="none" stroke="#FFFFFF" strokeWidth="0.9" strokeLinejoin="round" />
        <rect x="9" y="90" width="48" height="1.8" rx="0.9" fill="#FFFFFF" opacity="0.75" />
        <rect x="9" y="94.2" width="32" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.4" />
      </g>
    </Art>
  );
}

/* ===== components/ui/SiteThumb.jsx ===== */
/*
 * Draws a small, realistic looking client website entirely in code, so the
 * portfolio and hero never depend on stock photos. Everything is sized in
 * container query units (cqw) so the same design scales from a phone card to
 * a laptop screen. Replace with real screenshots whenever you have them.
 */

function SiteThumb({ project, stats = false }) {
  const { colors: c, brand, nav, headline, sub, cta, icon: Icon } = project;

  return (
    <div
      aria-hidden="true"
      className="font-display absolute inset-0 select-none overflow-hidden"
      style={{ background: c.bg, color: c.fg, containerType: "inline-size" }}
    >
      {/* Hero artwork: a real photo when provided, otherwise a soft gradient with an icon */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          top: project.image ? 0 : "9cqw",
          width: project.image ? "54cqw" : "46cqw",
          background: `linear-gradient(145deg, ${c.artA}, ${c.artB})`,
          overflow: "hidden",
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        ) : (
          <Icon
            strokeWidth={1}
            style={{
              position: "absolute",
              right: "6cqw",
              top: "46%",
              transform: "translateY(-50%)",
              width: "25cqw",
              height: "25cqw",
              color: c.iconColor,
              opacity: 0.3,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${c.bg} 0%, transparent ${project.image ? 46 : 58}%)`,
          }}
        />
      </div>

      {/* Navigation */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "9cqw",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4.5cqw",
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        <span style={{ fontSize: "2.1cqw", fontWeight: 700, letterSpacing: "0.14em" }}>{brand}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "2.4cqw", fontSize: "1.6cqw", color: c.muted }}>
          {nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
          <span
            style={{
              border: `1px solid ${c.muted}`,
              borderRadius: 999,
              padding: "0.7cqw 1.8cqw",
              color: c.fg,
              fontWeight: 600,
            }}
          >
            {cta}
          </span>
        </div>
      </div>

      {/* Copy */}
      <div style={{ position: "absolute", left: "5cqw", top: stats ? "15.5cqw" : "19cqw" }}>
        <div style={{ fontSize: "5.2cqw", fontWeight: 700, lineHeight: 1.07, letterSpacing: "-0.02em" }}>
          {headline.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{ marginTop: "2cqw", maxWidth: "34cqw", fontSize: "1.9cqw", lineHeight: 1.5, color: c.muted }}>
          {sub}
        </div>
        <div
          style={{
            marginTop: "2.8cqw",
            display: "inline-flex",
            alignItems: "center",
            gap: "1cqw",
            background: c.btnBg,
            color: c.btnFg,
            borderRadius: 999,
            padding: "1.1cqw 2.6cqw",
            fontSize: "1.8cqw",
            fontWeight: 600,
          }}
        >
          {cta} <span>{"\u2192"}</span>
        </div>
      </div>

      {/* Optional stats strip, used on the large hero screen */}
      {stats && project.stats && (
        <div
          style={{
            position: "absolute",
            left: "5cqw",
            right: "5cqw",
            bottom: "4cqw",
            display: "flex",
            gap: "9cqw",
            padding: "2cqw 3cqw",
            borderRadius: "1.6cqw",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${c.line}`,
          }}
        >
          {project.stats.map(([value, label]) => (
            <div key={label}>
              <div style={{ fontSize: "3cqw", fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: "1.4cqw", color: c.muted }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhoneSite({ project }) {
  const { colors: c, brand, headline, sub, cta, icon: Icon } = project;

  return (
    <div
      aria-hidden="true"
      className="font-display absolute inset-0 select-none overflow-hidden"
      style={{ background: c.bg, color: c.fg, containerType: "inline-size" }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "100cqw",
          background: `linear-gradient(160deg, ${c.artA}, ${c.artB})`,
          overflow: "hidden",
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
          />
        ) : (
          <Icon
            strokeWidth={1}
            style={{
              position: "absolute",
              left: "50%",
              top: "60%",
              transform: "translate(-50%, -50%)",
              width: "46cqw",
              height: "46cqw",
              color: c.iconColor,
              opacity: 0.3,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${c.bg} 0%, transparent 42%)`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "10cqw",
          height: "12cqw",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 7cqw",
        }}
      >
        <span style={{ fontSize: "4.4cqw", fontWeight: 700, letterSpacing: "0.12em" }}>{brand}</span>
        <span style={{ fontSize: "6cqw", lineHeight: 1 }}>{"\u2261"}</span>
      </div>

      <div style={{ position: "absolute", left: "7cqw", right: "7cqw", top: "32cqw" }}>
        <div style={{ fontSize: "11cqw", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
          {headline.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{ marginTop: "4cqw", fontSize: "4.6cqw", lineHeight: 1.45, color: c.muted }}>{sub}</div>
        <div
          style={{
            marginTop: "6cqw",
            display: "inline-block",
            background: c.btnBg,
            color: c.btnFg,
            borderRadius: 999,
            padding: "2.4cqw 6cqw",
            fontSize: "4.4cqw",
            fontWeight: 600,
          }}
        >
          {cta}
        </div>
      </div>
    </div>
  );
}

/* ===== components/ui/Devices.jsx ===== */
// Sizes are inline styles so the frames look identical everywhere.
function LaptopFrame({ children, className = "" }) {
  return (
    <div className={className}>
      <div
        style={{
          borderRadius: "14px 14px 4px 4px",
          background: "#1B1E26",
          padding: "1.4%",
          border: "1px solid #334155",
          boxShadow: "0 40px 80px -30px rgba(15,23,42,0.55)",
        }}
      >
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 6, background: "#000", aspectRatio: "16 / 10" }}>
          {children}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: 11,
          width: "108%",
          marginLeft: "-4%",
          borderRadius: "0 0 16px 16px",
          background: "linear-gradient(180deg, #E2E5EB 0%, #B4BAC6 100%)",
          boxShadow: "0 24px 30px -18px rgba(15,23,42,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            height: 4,
            width: "16%",
            transform: "translateX(-50%)",
            borderRadius: "0 0 6px 6px",
            background: "#94A3B8",
          }}
        />
      </div>
    </div>
  );
}

function PhoneFrame({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 22,
        background: "#1B1E26",
        padding: "3.5%",
        border: "1px solid #334155",
        boxShadow: "0 30px 60px -20px rgba(15,23,42,0.6)",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, background: "#000", aspectRatio: "9 / 19" }}>
        {children}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "2.2%",
            height: "2.2%",
            width: "30%",
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
}

/* ===== components/Navbar.jsx ===== */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const linksRef = useRef(null);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  // Mark the link for whichever section is crossing the middle of the screen.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Slide the glass capsule under the active link (desktop only).
  const measure = useCallback(() => {
    const root = linksRef.current;
    const el = root && root.querySelector('[data-active="true"]');
    if (el && el.offsetWidth) setPill({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
  }, []);

  useEffect(() => {
    measure();
  }, [active, measure]);

  useEffect(() => {
    const root = linksRef.current;
    if (!root) return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4" style={{ pointerEvents: "none" }}>
      <div className="relative mx-auto" style={{ maxWidth: 1180, pointerEvents: "auto" }}>
        <div className="glass-nav">
          <nav className="flex h-14 items-center justify-between pl-5 pr-2.5 sm:pl-6">
            <button onClick={() => go("home")} aria-label="KODA home" className="flex-shrink-0">
              <Logo dark />
            </button>

            <div ref={linksRef} className="relative hidden items-center gap-1 lg:flex">
              <span
                aria-hidden="true"
                className="nav-pill"
                style={{ width: pill.w, transform: `translate3d(${pill.x}px, 0, 0)`, opacity: pill.ready ? 1 : 0 }}
              />
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  className="nav-link"
                  data-active={active === link.id ? "true" : "false"}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block">
              <PrimaryButton onClick={() => go("contact")} className="!px-5 !py-2.5 !text-xs">
                Book a Free Consultation
              </PrimaryButton>
            </div>

            <button
              className="glass-btn lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="burger" data-open={open ? "true" : "false"}>
                <i />
                <i />
                <i />
              </span>
            </button>
          </nav>
        </div>

        <div className={`glass-panel lg:hidden${open ? " is-open" : ""}`} aria-hidden={!open}>
          <div className="flex flex-col gap-1 p-3">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className="nav-link menu-item text-left"
                style={{ fontSize: 15, fontWeight: 600, padding: "11px 16px", borderRadius: 16, "--i": i }}
                data-active={active === link.id ? "true" : "false"}
              >
                {link.label}
              </button>
            ))}
            <div className="menu-item mt-2" style={{ "--i": NAV_LINKS.length }}>
              <PrimaryButton onClick={() => go("contact")} className="w-full">
                Book a Free Consultation
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===== components/Hero.jsx ===== */
function FloatBadge({ icon: Icon, children, className = "", float = "nova-float", plain = true }) {
  return (
    <div
      style={{ boxShadow: "0 14px 40px -14px rgba(15,23,42,0.35)" }}
      className={`${float} absolute z-20 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200 ${className}`}
    >
      <Icon className={`h-6 w-6 flex-shrink-0 ${plain ? "text-slate-800" : ""}`} strokeWidth={1.6} />
      <span className="text-xs font-semibold leading-tight text-slate-900">{children}</span>
      <CheckBadge size={20} />
    </div>
  );
}

function HeroDevices() {
  const project = PORTFOLIO[0];
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 660, paddingTop: 44, paddingBottom: 40 }}>
      <div className="pointer-events-none absolute right-0 rounded-full" style={{ left: "6%", top: "16%", height: "72%", zIndex: -1, background: "radial-gradient(closest-side, rgba(37,99,235,0.2), rgba(37,99,235,0))" }} />

      <div style={{ width: "88%" }}>
        <LaptopFrame>
          <SiteThumb project={project} stats />
        </LaptopFrame>
      </div>

      <div className="absolute right-0 z-10" style={{ bottom: 34, width: "25%", minWidth: 84 }}>
        <PhoneFrame>
          <PhoneSite project={project} />
        </PhoneFrame>
      </div>

      <FloatBadge icon={GoogleG} plain={false} className="left-0 top-0 sm:-left-2">
        Google Business
        <br />
        setup
      </FloatBadge>
      <FloatBadge icon={Smartphone} float="nova-float-slow" className="right-0 top-2">
        Mobile ready
      </FloatBadge>
      <FloatBadge icon={TrendingUp} className="bottom-0 right-[2%]">
        Built for local
        <br />
        growth
      </FloatBadge>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-sec relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute rounded-full" style={{ top: -160, right: "-12%", height: 560, width: 760, background: "radial-gradient(closest-side, rgba(191,219,254,0.7), rgba(191,219,254,0))" }} />

      <div className="hero-grid relative mx-auto max-w-7xl px-5 sm:px-8">
        <div>
          <Reveal>
            <Eyebrow>
              Websites <span className="mx-1.5 text-blue-300">/</span> Google Business{" "}
              <span className="mx-1.5 text-blue-300">/</span> Digital Presence
            </Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="t-display font-display mt-4 max-w-xl">
              Your business deserves to be found.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="t-lead mt-4 max-w-lg">
              We build modern websites, set up and optimise your Google Business profile, and help local businesses
              turn online visibility into real customers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={() => scrollToId("contact")} className="!px-7 !py-4">
                Book a Free Consultation
              </PrimaryButton>
              <SecondaryButton onClick={() => scrollToId("portfolio")} className="!px-7 !py-4">
                See what&apos;s possible
              </SecondaryButton>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-4 flex items-center gap-2.5 text-sm text-slate-600">
              <CheckBadge size={22} tone="soft" />
              More visibility. More trust. More customers.
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <HeroDevices />
        </Reveal>
      </div>
    </section>
  );
}

/* ===== components/TrustedBy.jsx ===== */
function TrustedBy() {
  return (
    <section className="sec-sm border-y border-slate-100 bg-white">
      <Reveal>
        <div className="trust-row mx-auto max-w-7xl px-5 sm:px-8">
          <div>
            <p className="t-label">
              Trusted by local businesses across South Africa
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              {TRUSTED.map(({ name, sub, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2.5 text-slate-400 transition-colors duration-300 hover:text-slate-700">
                  <Icon className="h-6 w-6" strokeWidth={1.4} />
                  <div className="leading-tight">
                    <p className="font-display text-xs font-bold uppercase tracking-widest">{name}</p>
                    <p className="font-medium uppercase" style={{ fontSize: "9px", letterSpacing: "0.16em" }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="trust-rate">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-blue-600 text-blue-600" />
              ))}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">4.9/5 average rating</p>
            <p className="text-xs text-slate-500">from 120+ businesses</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ===== components/Advantage.jsx ===== */
const VISUALS = {
  website: { before: <BeforePhone kind="list" height={100} />, after: <WebsiteAfter height={100} /> },
  google: { before: <BeforePhone kind="listing" height={100} />, after: <GoogleAfter height={100} /> },
  social: { before: <BeforePhone kind="feed" height={88} />, after: <SocialAfter height={88} /> },
};

function CardIcon({ kind }) {
  if (kind === "google") {
    return (
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
        <GoogleG className="h-6 w-6" />
      </span>
    );
  }
  if (kind === "social") {
    return (
      <span className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: "#10B981" }}>
        <GrowthIcon className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: "#2563EB" }}>
      <Globe className="h-5 w-5" strokeWidth={1.7} />
    </span>
  );
}

function SocialStack() {
  return (
    <div style={{ height: 104, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
      <span className="grid h-7 w-7 place-items-center rounded-full text-white" style={{ background: "#1877F2" }}>
        <Facebook className="h-4 w-4" fill="white" strokeWidth={0} />
      </span>
      <span
        className="grid h-7 w-7 place-items-center text-white"
        style={{
          borderRadius: 9,
          background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
      >
        <Instagram className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="relative grid h-7 w-7 place-items-center rounded-full text-white" style={{ background: "#25D366" }}>
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
        <Phone className="absolute inset-0 m-auto h-2 w-2" fill="white" strokeWidth={0} />
      </span>
    </div>
  );
}

function Shot({ children, label, strong = false }) {
  return (
    <figure className="flex flex-col items-center">
      <div style={{ height: 104, display: "flex", alignItems: "center" }}>{children}</div>
      <figcaption className={`mt-2 text-xs font-medium ${strong ? "text-slate-800" : "text-slate-600"}`}>{label}</figcaption>
    </figure>
  );
}

function AdvantageCard({ card, i, last }) {
  const v = VISUALS[card.kind];
  return (
    <Reveal delay={i * 90} className="relative h-full">
      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardIcon kind={card.kind} />
        <h3 className="t-h3 mt-6">{card.title}</h3>
        <p className="t-body mt-2">{card.desc}</p>

        <div className="mt-auto flex items-start justify-center pt-7" style={{ gap: card.kind === "social" ? 6 : 10 }}>
          <Shot label="Before">{v.before}</Shot>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-700" style={{ marginTop: 44 }} />
          {card.kind === "social" && <SocialStack />}
          <Shot label="After" strong>{v.after}</Shot>
        </div>
      </div>

      {!last && (
        <ArrowRight className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-600 md:block" />
      )}
    </Reveal>
  );
}

function Advantage() {
  return (
    <section id="advantage" className="sec bg-paper">
      <div className="split-grid mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <Eyebrow>The KODA advantage</Eyebrow>
          <h2 className="t-h2 mt-4">From local business to local brand.</h2>
          <p className="t-lead mt-6 max-w-sm">
            A professional website, a verified Google Business profile and a consistent digital presence builds
            trust, gets you seen and turns interest into customers.
          </p>
        </Reveal>

        <div className="grid-3">
          {ADVANTAGE.map((card, i) => (
            <AdvantageCard key={card.title} card={card} i={i} last={i === ADVANTAGE.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/Services.jsx ===== */
function ServiceCard({ icon: Icon, title, desc, i }) {
  return (
    <Reveal delay={(i % 4) * 70}>
      <div className="group h-full rounded-2xl border border-slate-200 bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.25)]">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <h3 className="t-h3 mt-4">{title}</h3>
        <p className="t-body mt-2">{desc}</p>
      </div>
    </Reveal>
  );
}

function Services() {
  return (
    <section id="services" className="sec bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sec-head">
          <div>
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="t-h2 mt-3">
              Everything your business needs to succeed online
            </h2>
          </Reveal>
          </div>
          <Reveal delay={140}>
            <p className="t-lead">
              From your first website to ongoing SEO and support, one studio for every step.
            </p>
          </Reveal>
        </div>

        <div className="grid-4">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} {...s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/WhyChooseUs.jsx ===== */
function WhyChooseUs() {
  return (
    <section id="about" className="sec relative overflow-hidden bg-ink">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sec-head">
          <div>
          <Reveal>
            <Eyebrow dark>Why local businesses choose us</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="t-h2 inv mt-3">
              A website that works as hard as you do
            </h2>
          </Reveal>
          </div>
        </div>

        <div className="grid-4">
          {WHY_US.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="feature-card h-full p-5">
                <f.icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
                <h3 className="t-h3 inv mt-4">{f.title}</h3>
                <p className="t-body inv mt-2.5">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/Portfolio.jsx ===== */
function ProjectCard({ project, i }) {
  return (
    <Reveal delay={(i % 3) * 80}>
      <article className="group">
        <div className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl" style={{ aspectRatio: "16 / 10" }}>
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <SiteThumb project={project} />
          </div>
          <button
            onClick={() => scrollToId("contact")}
            aria-label={`View project: ${project.name}`}
            className="absolute bottom-3 left-3 inline-flex h-9 items-center rounded-full bg-slate-900 px-[9px] text-white shadow-lg transition-colors duration-300 hover:bg-blue-600 group-hover:bg-blue-600"
          >
            <ArrowUpRight className="h-[18px] w-[18px]" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:mr-1 group-hover:max-w-[100px] group-hover:opacity-100">
              View project
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="t-h3">{project.name}</h3>
            <p className="t-small mt-0.5">{project.category}</p>
          </div>
          <span className="flex-shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {project.tag}
          </span>
        </div>
      </article>
    </Reveal>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" className="sec bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sec-head">
          <Reveal>
            <Eyebrow>Our work</Eyebrow>
            <h2 className="t-h2 mt-3">
              Real businesses. Real results.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <button
              onClick={() => scrollToId("contact")}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Start your project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        <div className="grid-3">
          {PORTFOLIO.map((project, i) => (
            <ProjectCard key={project.name} project={project} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/Process.jsx ===== */
function Process() {
  return (
    <section id="process" className="sec bg-paper">
      <div className="split-grid mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <Eyebrow>Our process</Eyebrow>
          <h2 className="t-h2 mt-4">A process built to grow your business.</h2>
          <p className="t-lead mt-6 max-w-sm">
            Every step has one job: put your business in front of more customers.
          </p>
        </Reveal>

        <ol className="grid-4">
          {PROCESS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 90}>
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {step.n}
                </span>
                <step.icon className="h-5 w-5 text-slate-500" strokeWidth={1.6} />
                {i < PROCESS.length - 1 && (
                  <ArrowRight className="ml-auto hidden h-4 w-4 text-slate-300 lg:block" />
                )}
              </div>
              <h3 className="t-h3 mt-3">{step.title}</h3>
              <p className="t-body mt-2">{step.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8" style={{ marginTop: "clamp(1.25rem, 5vh, 3rem)" }}>
        <Reveal>
          <div className="bg-ink rounded-3xl px-6 py-6 sm:px-10 sm:py-8">
            <div className="max-w-2xl">
              <Eyebrow dark>The result</Eyebrow>
              <h2 className="t-h2 t-h2-sm inv mt-3">What this means for your business.</h2>
              <p className="t-lead inv mt-4">That is what a website and a strong online presence do for a local business.</p>
            </div>

            <div className="grid-4 mt-5 border-t border-white/10 pt-5">
              {OUTCOMES.map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-blue-400"
                    style={{ background: "rgba(37,99,235,0.18)" }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <h3 className="t-h3 inv mt-3">{title}</h3>
                  <p className="t-body inv mt-1.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ===== components/Pricing.jsx ===== */
function PricingCard({ plan, i }) {
  const hot = plan.highlighted;
  return (
    <Reveal delay={i * 90} className="h-full">
      <div
        className={`relative flex h-full flex-col rounded-2xl ${hot ? "bg-ink text-white" : "bg-white text-slate-900"}`}
        style={{
          padding: "clamp(1rem, 2.6vh, 1.5rem)",
          border: hot ? "2px solid #2563EB" : "1px solid #E2E8F0",
          boxShadow: hot ? "0 24px 50px -24px rgba(37,99,235,0.55)" : "0 1px 2px rgba(15,23,42,0.05)",
        }}
      >
        {hot && (
          <span
            className="absolute rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
            style={{ top: -13, left: "50%", transform: "translateX(-50%)" }}
          >
            MOST POPULAR
          </span>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`t-h3 ${hot ? "inv" : ""}`}>{plan.name}</h3>
            <p className={`t-body mt-1 ${hot ? "inv" : ""}`}>{plan.desc}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          {plan.was && (
            <span className="text-base font-medium text-slate-400">
              <span className="sr-only">Was </span>
              <s>{plan.was}</s>
            </span>
          )}
          <span className="font-display text-3xl font-bold tracking-tight">{plan.price}</span>
          <span className={`text-xs ${hot ? "text-slate-500" : "text-slate-400"}`}>{plan.note}</span>
        </div>

        <ul className="mt-4 flex-1 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <CheckBadge size={18} tone={hot ? "blueDark" : "blue"} className="mt-0.5" />
              <span className={hot ? "text-slate-300" : "text-slate-600"}>{f}</span>
            </li>
          ))}
        </ul>

        {hot ? (
          <PrimaryButton onClick={() => scrollToId("contact")} className="mt-5 w-full !py-3">
            Book a Free Consultation
          </PrimaryButton>
        ) : (
          <SecondaryButton onClick={() => scrollToId("contact")} className="mt-5 w-full !py-3">
            Book a Free Consultation
          </SecondaryButton>
        )}
      </div>
    </Reveal>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="sec bg-paper">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sec-head">
          <div>
            <Reveal>
              <Eyebrow>Pricing</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="t-h2 mt-3">Simple pricing, built for local businesses</h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <p className="t-lead">No hidden fees. No jargon. Just a website that pays for itself.</p>
          </Reveal>
        </div>

        <div className="pricing-grid" style={{ paddingTop: 12 }}>
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/Testimonials.jsx ===== */
function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function Testimonials() {
  return (
    <section className="sec bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sec-head">
          <div>
          <Reveal>
            <Eyebrow>Client stories</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="t-h2 mt-3">
              Trusted by business owners like you
            </h2>
          </Reveal>
          </div>
        </div>

        <div className="grid-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div className="h-full rounded-2xl border border-slate-200 bg-paper p-5 transition-shadow duration-300 hover:shadow-md">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="t-body mt-3">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-semibold text-white">
                    {initials(t.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== components/Faq.jsx ===== */
function FaqItem({ item, isOpen, onClick }) {
  return (
    <div style={{ borderBottom: "1px solid #E2E8F0" }}>
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 text-left"
        style={{ padding: "clamp(0.7rem, 1.8vh, 1.1rem) 0" }}
        aria-expanded={isOpen}
      >
        <span className="font-display text-base font-semibold text-slate-900">{item.q}</span>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0"
          style={{
            color: isOpen ? "#2563EB" : "#94A3B8",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.3s ease, color 0.3s ease",
          }}
        />
      </button>
      {/* Row height is set inline so answers are only open when chosen */}
      <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p className="t-body" style={{ paddingBottom: 14 }}>{item.a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="sec bg-paper">
      <div className="faq-grid mx-auto max-w-7xl px-5 sm:px-8">
        <div>
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="t-h2 mt-3">Common questions</h2>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div style={{ borderTop: "1px solid #E2E8F0" }}>
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} isOpen={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ===== components/CtaBand.jsx ===== */
function CtaBand() {
  return (
    <section className="sec-sm bg-white px-5 sm:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ink px-6 py-8 sm:px-10">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            fill="none"
          >
            <path d="M520 320 L900 -20" stroke="#2563EB" strokeOpacity="0.35" strokeWidth="1" />
            <path d="M600 320 L980 -20" stroke="#2563EB" strokeOpacity="0.22" strokeWidth="1" />
            <path d="M680 320 L1060 -20" stroke="#2563EB" strokeOpacity="0.14" strokeWidth="1" />
          </svg>

          <div className="cta-grid relative">
            <h2 className="t-h2 t-h2-sm inv">
              Ready to take your business to the next level?
            </h2>

            <div>
              <p className="t-lead inv max-w-sm">
                Let&apos;s build a website and online presence that works as hard as you do.
              </p>
              <PrimaryButton onClick={() => scrollToId("contact")} className="mt-4">
                Book a Free Consultation
              </PrimaryButton>
            </div>

            <div className="cta-brand">
              <Logo dark />
              <p className="t-label inv">
                Local businesses. Bigger futures.
              </p>
            </div>
          </div>

        </div>
      </Reveal>
    </section>
  );
}

/* ===== components/Contact.jsx ===== */
function ContactCard({ href, icon: Icon, label, value }) {
  return (
    <a
      href={href}
      className="panel-dark flex items-center gap-3 transition-colors hover:border-blue-500"
      style={{ padding: "0.75rem 1rem" }}
    >
      <span
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-blue-400"
        style={{ background: "rgba(37,99,235,0.18)" }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-xs text-slate-400">{label}</span>
        <span className="block text-sm font-semibold text-white">{value}</span>
      </span>
    </a>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", business: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="sec relative overflow-hidden bg-ink">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="contact-grid">
          <Reveal>
            <Eyebrow dark>Get in touch</Eyebrow>
            <h2 className="t-h2 inv mt-3">Tell us about your business.</h2>
            <p className="t-lead inv mt-3">Fill in the form or reach us directly. We reply within one working day.</p>

            <div className="mt-5 grid gap-3">
              <ContactCard href="tel:+27821234567" icon={Phone} label="Call us" value="+27 82 123 4567" />
              <ContactCard href="mailto:hello@koda.co.za" icon={Mail} label="Email us" value="hello@koda.co.za" />
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10" style={{ height: "clamp(110px, 17vh, 170px)" }}>
              <iframe
                title="KODA location"
                src="https://www.google.com/maps?q=Cape+Town,+South+Africa&output=embed"
                className="h-full w-full"
                style={{ border: 0, filter: "grayscale(1) invert(0.92) contrast(1.1)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="panel-dark" style={{ padding: "clamp(1rem, 3vh, 1.75rem)" }}>
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 260 }}>
                  <CheckBadge size={56} tone="softDark" />
                  <h3 className="t-h3 inv mt-4">Request received</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Thanks {form.name || "there"}, we'll reach out shortly to schedule your free consultation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Full name</span>
                    <input required name="name" value={form.name} onChange={handleChange} placeholder="Jane Dlamini" className="field" />
                  </label>
                  <label className="block">
                    <span className="field-label">Email</span>
                    <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@business.co.za" className="field" />
                  </label>
                  <label className="block">
                    <span className="field-label">Phone</span>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="082 123 4567" className="field" />
                  </label>
                  <label className="block">
                    <span className="field-label">Business name</span>
                    <input name="business" value={form.business} onChange={handleChange} placeholder="Your business" className="field" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="field-label">What do you need help with?</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about your business and what you're looking for..."
                      className="field"
                      style={{ resize: "none" }}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <PrimaryButton className="w-full sm:w-auto" icon={Send}>
                      Book a Free Consultation
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ===== components/Footer.jsx ===== */
const SOCIALS = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: MessageCircle, label: "WhatsApp" },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="foot-row">
          <Logo dark />

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollToId(l.id)}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 text-blue-400" />
              <div className="leading-tight">
                <p className="text-sm font-medium text-white">South Africa</p>
                <p className="mt-0.5 text-xs text-slate-400">Local. Reliable. Results.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-blue-500/50 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="foot-bottom mt-6 border-t border-white/10 pt-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} KODA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ===== components/WhatsAppButton.jsx ===== */
// The icon is the WhatsApp glyph on an iOS style squircle.
// iOS style squircle (superellipse) so the corners match the real app icon rather than a plain rounded square.
const SQUIRCLE = (() => {
  const n = 5;
  const steps = 120;
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (2 * Math.PI * i) / steps;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 30 + 30 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = 30 + 30 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/27821234567"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="wa-link fixed bottom-6 right-5 z-50 sm:bottom-8 sm:right-8"
    >
      <svg
        viewBox="0 0 60 60"
        width="60"
        height="60"
        aria-hidden="true"
        style={{ display: "block", filter: "drop-shadow(0 8px 14px rgba(15,23,42,0.3))" }}
      >
        <defs>
          <linearGradient id="wa-ios-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#61FD7D" />
            <stop offset="1" stopColor="#25CF43" />
          </linearGradient>
        </defs>
        <path d={SQUIRCLE} fill="url(#wa-ios-bg)" />
        <g transform="translate(10.2 10.2) scale(1.65)">
          <path
            fill="#FFFFFF"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
          />
        </g>
      </svg>
    </a>
  );
}

/* ===== App.jsx ===== */
export default function App() {
  return (
    <div className="font-sans text-slate-900 antialiased" style={{ scrollBehavior: "smooth" }}>
            <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Advantage />
        <Portfolio />
        <Process />
        <Services />
        <WhyChooseUs />
        <Pricing />
        <Testimonials />
        <Faq />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <Analytics />
    </div>
  );
}
