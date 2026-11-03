import React from "react";
import { PATHS } from "./serviceIcons.js";

// The nine pictures for the Services deck, drawn as vectors in the same look as the hero cards: a light frame with a
// dark card inside, lime accents, rounded tiles. Illustrations only: every page, address and name is made up, and
// nothing shows a score, a ranking or a result. They are still pictures; there is no animation.
const INK = "#101010";
const INK2 = "#1B1B1B";
const INK3 = "#2A2A2A";
const INK4 = "#3A3A3A";
const PAPER = "#F6F6F4";
const PAPER2 = "#E8E7E5";
const PAPER3 = "#CFCFCC";
const ACID = "#BDF64F";
const SOFT = "#A9A9A6";
const GREY = "#8A8A87";

const base = (y, size) => y + size * 0.9; // text: y is the top of the line

const Txt = ({ x, y, size, w = 700, fill = PAPER, anchor = "start", children }) => (
  <text className="ai-text" x={x} y={base(y, size)} fontSize={size} fontWeight={w} fill={fill} textAnchor={anchor}>{children}</text>
);
const Ic = ({ n, size, cx, cy, fill = ACID }) => (
  <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 256})`}>
    <path d={PATHS[n]} fill={fill} />
  </g>
);

// 600 x 400, fitted inside its panel without cropping ("meet"). The panel is the same light grey as the frame, so any
// spare room above, below or beside the picture just looks like more frame.
function Panel({ children }) {
  return (
    <svg className="svc-svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" role="presentation" focusable="false">
      <rect width="600" height="400" fill={PAPER2} />
      <rect x="28" y="40" width="544" height="320" rx="36" fill={INK} />
      {children}
    </svg>
  );
}

// 1 Website design: a browser window, a page, a phone, three proof chips
export function WebsiteArt() {
  const chips = [["mobile", "Mobile"], ["lightning", "Fast"], ["shield", "Secure"]];
  return (
    <Panel>
      <rect x="56" y="64" width="488" height="206" rx="22" fill={INK2} stroke={INK3} strokeWidth="2" />
      <rect x="56" y="64" width="488" height="40" rx="22" fill={INK3} />
      <rect x="56" y="82" width="488" height="22" fill={INK3} />
      <circle cx="82" cy="84" r="6" fill={ACID} />
      <circle cx="102" cy="84" r="6" fill={INK4} />
      <circle cx="122" cy="84" r="6" fill={INK4} />
      <rect x="146" y="72" width="370" height="24" rx="12" fill={INK} />
      <Txt x={162} y={76} size={16} w={500} fill={SOFT}>yourbusiness.co.za</Txt>
      <rect x="84" y="126" width="190" height="18" rx="9" fill={PAPER} />
      <rect x="84" y="154" width="130" height="18" rx="9" fill={PAPER} />
      <rect x="84" y="204" width="104" height="34" rx="17" fill={ACID} />
      <rect x="312" y="122" width="132" height="116" rx="18" fill={INK4} />
      <circle cx="378" cy="170" r="20" fill={ACID} opacity="0.9" />
      <rect x="432" y="112" width="92" height="148" rx="28" fill={PAPER} stroke={INK} strokeWidth="4" />
      <rect x="458" y="124" width="40" height="6" rx="3" fill={PAPER3} />
      <rect x="448" y="148" width="62" height="12" rx="6" fill={INK} />
      <rect x="448" y="168" width="40" height="12" rx="6" fill={INK} />
      <rect x="448" y="218" width="60" height="28" rx="14" fill={ACID} />
      {chips.map(([ic, t], i) => {
        const x = 56 + i * 168;
        return (
          <g key={t}>
            <rect x={x} y="288" width="152" height="46" rx="23" fill={INK2} />
            <Ic n={ic} size={24} cx={x + 32} cy={311} />
            <Txt x={x + 56} y={300} size={20} w={800}>{t}</Txt>
          </g>
        );
      })}
    </Panel>
  );
}

// 2 Branding and logo design: a logo, colours, type and a business card
export function BrandingArt() {
  return (
    <Panel>
      <rect x="56" y="68" width="200" height="200" rx="44" fill={ACID} />
      <rect x="106" y="118" width="100" height="100" rx="26" fill={INK} transform="rotate(45 156 168)" />
      <circle cx="156" cy="168" r="18" fill={PAPER} />
      <rect x="56" y="292" width="200" height="44" rx="22" fill={INK2} />
      <Txt x={156} y={304} size={18} w={700} anchor="middle">Your brand</Txt>
      {[[322, INK2, PAPER], [384, ACID, null], [446, PAPER, null], [508, GREY, null]].map(([cx, f, s], i) => (
        <circle key={i} cx={cx} cy="96" r="24" fill={f} stroke={s || "none"} strokeWidth={s ? 3 : 0} />
      ))}
      <Txt x={300} y={134} size={76} w={800}>Aa</Txt>
      <rect x="430" y="166" width="100" height="10" rx="5" fill={INK4} />
      <rect x="430" y="188" width="76" height="10" rx="5" fill={INK4} />
      <rect x="300" y="236" width="244" height="104" rx="20" fill={PAPER} />
      <circle cx="338" cy="288" r="16" fill={ACID} />
      <rect x="372" y="266" width="120" height="12" rx="6" fill={INK} />
      <rect x="372" y="288" width="92" height="10" rx="5" fill={PAPER3} />
      <rect x="372" y="308" width="104" height="10" rx="5" fill={PAPER3} />
    </Panel>
  );
}

// 3 Website redesign: the old page, an arrow, the new page
export function RedesignArt() {
  return (
    <Panel>
      <rect x="56" y="68" width="200" height="240" rx="24" fill={INK2} stroke={GREY} strokeWidth="2" strokeDasharray="8 8" />
      {[[76, 92, 150, 10], [76, 112, 110, 10], [76, 140, 160, 8], [76, 156, 140, 8], [76, 172, 100, 8]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} fill={INK4} />
      ))}
      <rect x="76" y="200" width="60" height="24" rx="6" fill={INK4} />
      <rect x="146" y="200" width="80" height="24" rx="6" fill={INK4} />
      <rect x="76" y="240" width="150" height="48" rx="8" fill={INK4} />
      <circle cx="300" cy="188" r="30" fill={ACID} />
      <path d="M288 188 H312 M302 177 L313 188 L302 199" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="344" y="68" width="200" height="240" rx="24" fill={PAPER} />
      <rect x="364" y="92" width="130" height="16" rx="8" fill={INK} />
      <rect x="364" y="116" width="90" height="16" rx="8" fill={INK} />
      <rect x="364" y="150" width="150" height="8" rx="4" fill={PAPER3} />
      <rect x="364" y="166" width="120" height="8" rx="4" fill={PAPER3} />
      <rect x="364" y="196" width="90" height="32" rx="16" fill={ACID} />
      <rect x="364" y="246" width="160" height="42" rx="14" fill={INK} />
      <circle cx="444" cy="267" r="12" fill={ACID} />
    </Panel>
  );
}

// 4 Ecommerce stores: products, add to basket, secure checkout
export function EcommerceArt() {
  return (
    <Panel>
      {[0, 1, 2].map((i) => {
        const x = 56 + i * 168;
        return (
          <g key={i}>
            <rect x={x} y="68" width="152" height="172" rx="22" fill={INK2} />
            <rect x={x + 12} y="80" width="128" height="86" rx="14" fill={INK4} />
            {i === 0 && <circle cx={x + 76} cy="123" r="16" fill={ACID} />}
            {i === 1 && <rect x={x + 60} y="107" width="32" height="32" rx="9" fill={ACID} />}
            {i === 2 && <circle cx={x + 76} cy="123" r="14" fill={PAPER} />}
            <rect x={x + 14} y="180" width="96" height="10" rx="5" fill={PAPER} />
            <rect x={x + 14} y="200" width="56" height="10" rx="5" fill={ACID} />
            <circle cx={x + 124} cy="208" r="16" fill={ACID} />
            <Ic n="plus" size={14} cx={x + 124} cy={208} fill={INK} />
          </g>
        );
      })}
      <rect x="126" y="268" width="348" height="54" rx="27" fill={ACID} />
      <Ic n="shield" size={28} cx={164} cy={295} fill={INK} />
      <Txt x={194} y={284} size={22} w={800} fill={INK}>Secure checkout</Txt>
    </Panel>
  );
}

// 5 Booking systems: a calendar, time slots, a confirmation
export function BookingArt() {
  const slots = ["09:00", "10:30", "14:00"];
  return (
    <Panel>
      <rect x="56" y="68" width="252" height="240" rx="26" fill={INK2} />
      <rect x="80" y="90" width="100" height="14" rx="7" fill={PAPER} />
      {Array.from({ length: 28 }, (_, k) => {
        const c = k % 7;
        const r = Math.floor(k / 7);
        const hit = c === 3 && r === 2;
        return hit ? null : <circle key={k} cx={86 + c * 30} cy={142 + r * 34} r="6" fill={INK4} />;
      })}
      <circle cx="176" cy="210" r="17" fill={ACID} />
      <Ic n="check" size={18} cx={176} cy={210} fill={INK} />
      {slots.map((t, i) => (
        <g key={t}>
          <rect x="332" y={76 + i * 60} width="212" height="50" rx="25" fill={i === 0 ? ACID : INK2} stroke={i === 0 ? "none" : INK4} strokeWidth="2" />
          <Txt x={360} y={76 + i * 60 + 15} size={20} w={800} fill={i === 0 ? INK : PAPER}>{t}</Txt>
          {i === 0 && <Ic n="checkCircle" size={26} cx={514} cy={101} fill={INK} />}
        </g>
      ))}
      <rect x="332" y="262" width="212" height="46" rx="23" fill={PAPER} />
      <Ic n="checkCircle" size={26} cx={362} cy={285} fill={INK} />
      <Txt x={386} y={273} size={20} w={800} fill={INK}>Booked</Txt>
    </Panel>
  );
}

// 6 Google Business Profile: a map pin and a profile card
export function ProfileArt() {
  return (
    <Panel>
      <rect x="56" y="68" width="230" height="240" rx="26" fill={INK2} />
      <path d="M56 150 L286 118 M120 68 L172 308 M56 240 L286 228" fill="none" stroke={INK3} strokeWidth="8" strokeLinecap="round" />
      <circle cx="168" cy="176" r="46" fill={ACID} opacity="0.18" />
      <Ic n="pin" size={76} cx={168} cy={166} />
      <rect x="310" y="68" width="234" height="240" rx="26" fill={PAPER} />
      <circle cx="348" cy="108" r="22" fill={INK} />
      <rect x="382" y="94" width="124" height="14" rx="7" fill={INK} />
      <rect x="382" y="118" width="88" height="10" rx="5" fill={PAPER3} />
      <rect x="334" y="156" width="88" height="32" rx="16" fill={ACID} />
      <circle cx="354" cy="172" r="5" fill={INK} />
      <Txt x={366} y={162} size={16} w={800} fill={INK}>Open</Txt>
      {[["phone", 368], ["navigate", 427], ["globe", 486]].map(([n, cx]) => (
        <g key={n}>
          <circle cx={cx} cy="244" r="26" fill={INK} />
          <Ic n={n} size={26} cx={cx} cy={244} />
        </g>
      ))}
    </Panel>
  );
}

// 7 SEO optimisation: a search and a result picked out
export function SeoArt() {
  return (
    <Panel>
      <rect x="56" y="68" width="488" height="52" rx="26" fill={INK2} stroke={INK4} strokeWidth="2" />
      <Ic n="search" size={26} cx={88} cy={94} />
      <rect x="116" y="86" width="210" height="16" rx="8" fill={PAPER} />
      {[0, 1, 2].map((i) => {
        const y = 140 + i * 66;
        return (
          <g key={i}>
            <rect x="56" y={y} width="488" height="54" rx="20" fill={INK2} stroke={i === 0 ? ACID : "none"} strokeWidth={i === 0 ? 3 : 0} />
            <circle cx="88" cy={y + 27} r="13" fill={i === 0 ? ACID : INK4} />
            <rect x="116" y={y + 11} width={i === 0 ? 170 : 130} height="12" rx="6" fill={PAPER} opacity={i === 0 ? 1 : 0.6} />
            <rect x="116" y={y + 31} width={i === 0 ? 300 : 250} height="10" rx="5" fill={INK4} />
          </g>
        );
      })}
    </Panel>
  );
}

// 8 AI SEO and ad campaigns: two lines rising (SEO and ads) and where we help the business get found
export function AiGrowthArt() {
  return (
    <Panel>
      <rect x="60" y="84" width="34" height="8" rx="4" fill={ACID} />
      <Txt x={106} y={74} size={20} w={500} fill={SOFT}>AI SEO</Txt>
      <rect x="230" y="84" width="34" height="8" rx="4" fill={PAPER} />
      <Txt x={276} y={74} size={20} w={500} fill={SOFT}>AI Ads</Txt>
      <circle cx="508" cy="86" r="22" fill={ACID} />
      <Ic n="sparkle" size={26} cx={508} cy={86} fill={INK} />
      {[150, 200, 250].map((y) => (
        <line key={y} x1="60" x2="540" y1={y} y2={y} stroke={INK3} strokeWidth="2" />
      ))}
      <path d="M72 262 L150 240 L228 246 L316 206 L394 214 L496 176" fill="none" stroke={PAPER} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 262 L150 226 L222 242 L308 176 L388 192 L496 126" fill="none" stroke={ACID} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="496" cy="176" r="9" fill={PAPER} />
      <circle cx="496" cy="126" r="12" fill={ACID} />
      {["Google", "ChatGPT", "Gemini"].map((t, i) => {
        const x = 60 + i * 165;
        return (
          <g key={t}>
            <rect x={x} y="292" width="150" height="44" rx="22" fill={INK2} />
            <circle cx={x + 28} cy="314" r="6" fill={ACID} />
            <Txt x={x + 46} y={304} size={20} w={800}>{t}</Txt>
          </g>
        );
      })}
    </Panel>
  );
}

// 9 Website maintenance: the jobs we look after, and the site staying online
export function MaintenanceArt() {
  const jobs = ["Updates", "Backups", "Security", "Uptime"];
  return (
    <Panel>
      {jobs.map((t, i) => {
        const y = 68 + i * 62;
        return (
          <g key={t}>
            <rect x="56" y={y} width="330" height="50" rx="25" fill={INK2} />
            <Ic n="checkCircle" size={28} cx={88} cy={y + 25} />
            <Txt x={118} y={y + 15} size={22} w={800}>{t}</Txt>
          </g>
        );
      })}
      <rect x="410" y="68" width="134" height="236" rx="26" fill={ACID} />
      <Ic n="shield" size={60} cx={477} cy={142} fill={INK} />
      <Txt x={477} y={188} size={22} w={800} fill={INK} anchor="middle">Online</Txt>
      <circle cx="477" cy="240" r="9" fill={INK} />
      <circle cx="477" cy="240" r="17" fill="none" stroke={INK} strokeWidth="3" opacity="0.35" />
    </Panel>
  );
}

// 10 SEO and social media: found in search, shared on social
export function SocialArt() {
  return (
    <Panel>
      <rect x="56" y="68" width="230" height="240" rx="26" fill={INK2} />
      <rect x="76" y="88" width="190" height="34" rx="17" fill={INK} stroke={INK4} strokeWidth="2" />
      <Ic n="search" size={18} cx={96} cy={105} />
      <rect x="76" y="144" width="190" height="46" rx="16" fill={INK} stroke={ACID} strokeWidth="3" />
      <circle cx="100" cy="167" r="10" fill={ACID} />
      <rect x="120" y="157" width="110" height="10" rx="5" fill={PAPER} />
      <rect x="120" y="174" width="130" height="8" rx="4" fill={INK4} />
      <rect x="76" y="202" width="190" height="46" rx="16" fill={INK} />
      <circle cx="100" cy="225" r="10" fill={INK4} />
      <rect x="120" y="215" width="90" height="10" rx="5" fill={PAPER} opacity="0.6" />
      <rect x="120" y="232" width="120" height="8" rx="4" fill={INK4} />
      <rect x="314" y="68" width="230" height="240" rx="26" fill={PAPER} />
      <circle cx="346" cy="102" r="18" fill={INK} />
      <rect x="374" y="90" width="100" height="12" rx="6" fill={INK} />
      <rect x="374" y="108" width="70" height="10" rx="5" fill={PAPER3} />
      <rect x="334" y="136" width="190" height="98" rx="16" fill={INK} />
      <circle cx="429" cy="185" r="24" fill={ACID} />
      <Ic n="heart" size={26} cx={350} cy={266} fill={INK} />
      <Ic n="chat" size={26} cx={392} cy={266} fill={INK} />
      <Ic n="share" size={26} cx={434} cy={266} fill={INK} />
      <circle cx="300" cy="188" r="15" fill={ACID} stroke={INK} strokeWidth="4" />
      <Ic n="arrow" size={16} cx={300} cy={188} fill={INK} />
    </Panel>
  );
}

export const SERVICE_ART = [WebsiteArt, BrandingArt, RedesignArt, EcommerceArt, BookingArt, ProfileArt, SeoArt, AiGrowthArt, MaintenanceArt, SocialArt];
