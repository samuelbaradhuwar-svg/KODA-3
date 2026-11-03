import React from "react";
import { MARK_PATH } from "../lib/logo-paths.js";

// The pictures for slides 1 (Website design) and 2 (Google Workspace) of the hero story, drawn as vectors in the same
// look as slide 3 (AiPresenceArt): a dark card on a light frame, lime accents, rounded tiles. Illustrations only: the web
// page and the email address are made up. The hero sets data-on="1" on a slide while it is showing, and the animation
// lives in index.css (.wd-* for slide 1, .wk-* for slide 2).
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
const MUTED = "#595958";

// Phosphor icons (bold), 256 x 256
const ICONS = {
  mobile: "M176,12H80A28,28,0,0,0,52,40V216a28,28,0,0,0,28,28h96a28,28,0,0,0,28-28V40A28,28,0,0,0,176,12ZM76,76H180V180H76Zm4-40h96a4,4,0,0,1,4,4V52H76V40A4,4,0,0,1,80,36Zm96,184H80a4,4,0,0,1-4-4V204H180v12A4,4,0,0,1,176,220Z",
  lightning:
    "M219.71,117.38a12,12,0,0,0-7.25-8.52L161.28,88.39l10.59-70.61a12,12,0,0,0-20.64-10l-112,120a12,12,0,0,0,4.31,19.33l51.18,20.47L84.13,238.22a12,12,0,0,0,20.64,10l112-120A12,12,0,0,0,219.71,117.38ZM113.6,203.55l6.27-41.77a12,12,0,0,0-7.41-12.92L68.74,131.37,142.4,52.45l-6.27,41.77a12,12,0,0,0,7.41,12.92l43.72,17.49Z",
  shield:
    "M208,36H48A20,20,0,0,0,28,56v56c0,54.29,26.32,87.22,48.4,105.29,23.71,19.39,47.44,26,48.44,26.29a12.1,12.1,0,0,0,6.32,0c1-.28,24.73-6.9,48.44-26.29,22.08-18.07,48.4-51,48.4-105.29V56A20,20,0,0,0,208,36Zm-4,76c0,35.71-13.09,64.69-38.91,86.15A126.28,126.28,0,0,1,128,219.38a126.14,126.14,0,0,1-37.09-21.23C65.09,176.69,52,147.71,52,112V60H204ZM79.51,144.49a12,12,0,1,1,17-17L112,143l47.51-47.52a12,12,0,0,1,17,17l-56,56a12,12,0,0,1-17,0Z",
  envelope:
    "M224,44H32A12,12,0,0,0,20,56V192a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A12,12,0,0,0,224,44ZM193.15,68,128,127.72,62.85,68ZM44,188V83.28l75.89,69.57a12,12,0,0,0,16.22,0L212,83.28V188Z",
  calendar:
    "M208,28H188V24a12,12,0,0,0-24,0v4H92V24a12,12,0,0,0-24,0v4H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28ZM68,52a12,12,0,0,0,24,0h72a12,12,0,0,0,24,0h16V76H52V52ZM52,204V100H204V204Z",
  folder:
    "M216,68H132L105.33,48a20.12,20.12,0,0,0-12-4H40A20,20,0,0,0,20,64V200a20,20,0,0,0,20,20H216.89A19.13,19.13,0,0,0,236,200.89V88A20,20,0,0,0,216,68Zm-4,128H44V68H92l28.8,21.6A12,12,0,0,0,128,92h84Z",
  video:
    "M249.45,69.31a12,12,0,0,0-12.51,1L212,88.43V72a20,20,0,0,0-20-20H32A20,20,0,0,0,12,72V184a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V167.57l24.94,18.14A12,12,0,0,0,256,176V80A12,12,0,0,0,249.45,69.31ZM188,180H36V76H188Zm44-27.57-20-14.54V118.11l20-14.54Z",
};

// text: y is the top of the line; the baseline sits a little below it
const baseline = (y, size) => y + size * 0.9;

function Frame({ title, sub, children }) {
  return (
    <svg className="ai-art" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" role="presentation" focusable="false">
      <rect width="800" height="800" fill={PAPER2} />
      <g transform="translate(100 100) scale(0.106)">
        <path d={MARK_PATH} fill={INK} fillRule="evenodd" />
      </g>
      <text className="ai-text" x="150" y={baseline(64, 36)} fontSize="36" fontWeight="800" fill={INK}>{title}</text>
      <text className="ai-text" x="150" y={baseline(108, 26)} fontSize="26" fontWeight="500" fill={MUTED}>{sub}</text>
      <rect x="60" y="170" width="680" height="570" rx="56" fill={INK} />
      {children}
    </svg>
  );
}

function Icon({ name, size, cx, cy }) {
  return (
    <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 256})`}>
      <path d={ICONS[name]} fill={ACID} />
    </g>
  );
}

// ---------------------------------------------------------------------------------------------------------------- slide 1
const WD_TILES = [
  { x: 100, label: "Mobile", icon: "mobile" },
  { x: 305, label: "Fast", icon: "lightning" },
  { x: 510, label: "Secure", icon: "shield" },
];

export function WebsiteDesignArt() {
  return (
    <Frame title="Website design" sub="Fast, mobile friendly and secure">
      {/* the browser window */}
      <g className="wd-window">
        <rect x="100" y="214" width="600" height="250" rx="28" fill={INK2} stroke={INK3} strokeWidth="2" />
        <rect x="100" y="214" width="600" height="56" rx="28" fill={INK3} />
        <rect x="100" y="242" width="600" height="28" fill={INK3} />
        <circle cx="130" cy="242" r="7" fill={ACID} />
        <circle cx="154" cy="242" r="7" fill={INK4} />
        <circle cx="178" cy="242" r="7" fill={INK4} />
        <rect x="208" y="227" width="460" height="30" rx="15" fill={INK} />
        <text className="ai-text" x="226" y={baseline(231, 20)} fontSize="20" fontWeight="500" fill={SOFT}>yourbusiness.co.za</text>
      </g>
      {/* the page inside it: two headline bars write themselves in, the picture appears, the button pops */}
      <rect className="wd-bar wd-bar-1" x="132" y="304" width="279" height="24" rx="12" fill={PAPER} />
      <rect className="wd-bar wd-bar-2" x="132" y="340" width="193" height="24" rx="12" fill={PAPER} />
      <rect className="wd-btn" x="132" y="404" width="140" height="44" rx="22" fill={ACID} />
      <g className="wd-pic">
        <rect x="475" y="300" width="193" height="130" rx="22" fill={INK4} />
        <circle cx="571" cy="352" r="26" fill={ACID} opacity="0.9" />
      </g>
      {/* the same page on a phone */}
      <g className="wd-phone">
        <rect x="566" y="300" width="118" height="170" rx="38" fill={PAPER} stroke={INK} strokeWidth="4" />
        <rect x="599" y="314" width="52" height="8" rx="4" fill={PAPER3} />
        <rect x="588" y="350" width="83" height="16" rx="8" fill={INK} />
        <rect x="588" y="376" width="54" height="16" rx="8" fill={INK} />
        <rect x="588" y="412" width="74" height="40" rx="20" fill={ACID} />
      </g>
      {/* proof tiles */}
      {WD_TILES.map((t, i) => (
        <g key={t.label} className="wd-tile" style={{ "--i": i }}>
          <rect x={t.x} y="486" width="190" height="214" rx="34" fill={INK2} />
          <Icon name={t.icon} size={56} cx={t.x + 95} cy={556} />
          <text className="ai-text" x={t.x + 95} y={baseline(618, 30)} fontSize="30" fontWeight="800" fill={PAPER} textAnchor="middle">{t.label}</text>
        </g>
      ))}
    </Frame>
  );
}

// ---------------------------------------------------------------------------------------------------------------- slide 2
const WK_ROWS = [
  { dot: ACID, a: 150, b: 300 },
  { dot: PAPER, a: 130, b: 300 },
  { dot: GREY, a: 170, b: 260 },
];
const WK_TOOLS = [
  { label: "Email", icon: "envelope" },
  { label: "Calendar", icon: "calendar" },
  { label: "Drive", icon: "folder" },
  { label: "Meet", icon: "video" },
];

export function WorkspaceArt() {
  return (
    <Frame title="Google Workspace" sub="Email and tools on your own domain">
      <g className="wk-head">
        <Icon name="envelope" size={40} cx={120} cy={232} />
        <text className="ai-text" x="150" y={baseline(214, 32)} fontSize="32" fontWeight="700" fill={PAPER}>Inbox</text>
        <rect x="420" y="208" width="280" height="48" rx="24" fill="none" stroke={ACID} strokeWidth="3" />
        <text className="ai-text" x="560" y={baseline(220, 24)} fontSize="24" fontWeight="700" fill={ACID} textAnchor="middle">@yourbusiness.co.za</text>
      </g>
      {/* three messages arrive on your own domain; the first is the new one */}
      {WK_ROWS.map((r, i) => {
        const y = 276 + i * 86;
        return (
          <g key={i} className="wk-row" style={{ "--i": i }}>
            <rect x="100" y={y} width="600" height="72" rx="26" fill={INK2} />
            <circle cx="142" cy={y + 36} r="22" fill={r.dot} />
            <rect x="182" y={y + 16} width={r.a} height="16" rx="8" fill={PAPER} />
            <rect x="182" y={y + 42} width={r.b} height="12" rx="6" fill={INK4} />
            <circle className={i === 0 ? "wk-dot" : undefined} cx="668" cy={y + 36} r="7" fill={i === 0 ? ACID : INK4} />
          </g>
        );
      })}
      <rect className="wk-new" x="100" y="276" width="600" height="72" rx="26" fill="none" stroke={ACID} strokeWidth="3" />
      {/* the tools that come with it */}
      {WK_TOOLS.map((t, i) => {
        const x = 100 + i * 154;
        return (
          <g key={t.label} className="wk-tile" style={{ "--i": i }}>
            <rect x={x} y="556" width="138" height="144" rx="32" fill={INK2} />
            <Icon name={t.icon} size={46} cx={x + 69} cy={611} />
            <text className="ai-text" x={x + 69} y={baseline(648, 26)} fontSize="26" fontWeight="800" fill={PAPER} textAnchor="middle">{t.label}</text>
          </g>
        );
      })}
    </Frame>
  );
}
