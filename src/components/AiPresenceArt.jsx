import React from "react";
import { MARK_PATH } from "../lib/logo-paths.js";

// The picture for slide 3 of the hero story (Digital presence): a report card with two rising lines, AI SEO and AI Ads,
// and three service tiles. Drawn as vectors so it stays sharp at any size and the lines can draw themselves in.
// It is an illustration: it carries no numbers and makes no claim about a particular result.
// The hero marks the slide data-on="1" while it is on screen; the animation lives in index.css (.ai-art).
const INK = "#101010";
const INK2 = "#1B1B1B";
const PAPER = "#F6F6F4";
const PAPER2 = "#E8E7E5";
const ACID = "#BDF64F";
const SOFT = "#A9A9A6";
const MUTED = "#595958";

// Phosphor icons (bold), 256 x 256
const ICONS = {
  search: "M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z",
  megaphone:
    "M252,120a52.06,52.06,0,0,0-52-52H160.32c-3.44-.21-52.6-4-99.46-43.3A20,20,0,0,0,28,40V200a19.8,19.8,0,0,0,11.54,18.12,19.86,19.86,0,0,0,21.32-2.81A192.92,192.92,0,0,1,144,174.47v26.2a20,20,0,0,0,8.9,16.64,11.35,11.35,0,0,0,1.39.8l14.44,7.06A20,20,0,0,0,198.37,213l11.09-41.82A52.07,52.07,0,0,0,252,120ZM52,191.63V48.4c36.17,28.07,72.17,38.1,92,41.66V150C124.17,153.52,88.17,163.55,52,191.63ZM176.39,202.2,168,198.1V172h16.4ZM200,148H168V92h32a28,28,0,1,1,0,56Z",
  chart:
    "M236,208a12,12,0,0,1-12,12H32a12,12,0,0,1-12-12V48a12,12,0,0,1,24,0v99l43.51-43.52a12,12,0,0,1,17,0L128,127l43-43H160a12,12,0,0,1,0-24h40a12,12,0,0,1,12,12v40a12,12,0,0,1-24,0V101l-51.51,51.52a12,12,0,0,1-17,0L96,129,44,181v15H224A12,12,0,0,1,236,208Z",
};

const TILES = [
  { x: 100, label: "AI SEO", icon: "search" },
  { x: 305, label: "AI Ads", icon: "megaphone" },
  { x: 510, label: "Reporting", icon: "chart" },
];

export default function AiPresenceArt() {
  return (
    <svg className="ai-art" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" role="presentation" focusable="false">
      <rect width="800" height="800" fill={PAPER2} />
      <g transform="translate(100 100) scale(0.106)">
        <path d={MARK_PATH} fill={INK} fillRule="evenodd" />
      </g>
      <text className="ai-text" x="150" y="94" fontSize="36" fontWeight="800" fill={INK}>Digital presence</text>
      <text className="ai-text" x="150" y="134" fontSize="26" fontWeight="500" fill={MUTED}>Found in Google and AI answers</text>

      <rect x="60" y="170" width="680" height="570" rx="56" fill={INK} />
      <text className="ai-text" x="100" y="248" fontSize="32" fontWeight="700" fill={PAPER}>AI visibility</text>

      {/* legend */}
      <rect x="100" y="288" width="34" height="8" rx="4" fill={ACID} />
      <text className="ai-text" x="146" y="298" fontSize="24" fontWeight="500" fill={SOFT}>AI SEO</text>
      <rect x="260" y="288" width="34" height="8" rx="4" fill={PAPER} />
      <text className="ai-text" x="306" y="298" fontSize="24" fontWeight="500" fill={SOFT}>AI Ads</text>

      {/* grid */}
      {[330, 390, 450].map((y) => (
        <line key={y} x1="100" x2="700" y1={y} y2={y} stroke="#2A2A2A" strokeWidth="2" />
      ))}

      {/* the two lines */}
      <path className="ai-line ai-line-ads" pathLength="1" d="M110 440 L220 404 L330 412 L450 360 L560 370 L690 318" fill="none" stroke={PAPER} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path className="ai-line ai-line-seo" pathLength="1" d="M110 440 L220 390 L320 410 L440 310 L550 332 L690 232" fill="none" stroke={ACID} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="ai-dot ai-dot-ads" cx="690" cy="318" r="11" fill={PAPER} />
      <circle className="ai-dot ai-dot-seo" cx="690" cy="232" r="15" fill={ACID} />
      <circle className="ai-ring" cx="690" cy="232" r="28" fill="none" stroke={ACID} strokeWidth="3" />

      {/* the three services */}
      {TILES.map((t, i) => (
        <g key={t.label} className="ai-tile" style={{ "--i": i }}>
          <rect x={t.x} y="486" width="190" height="214" rx="34" fill={INK2} />
          <g transform={`translate(${t.x + 95 - 28} ${556 - 28}) scale(${56 / 256})`}>
            <path d={ICONS[t.icon]} fill={ACID} />
          </g>
          <text className="ai-text" x={t.x + 95} y="646" fontSize="30" fontWeight="800" fill={PAPER} textAnchor="middle">{t.label}</text>
        </g>
      ))}
    </svg>
  );
}
