import React from "react";
import { Browser, CalendarBlank, Envelope, FolderSimple, MapPin, VideoCamera } from "@phosphor-icons/react";
import LOGO_DARK from "../assets/koda-icon-black.webp";

// Six pieces of a business's digital presence, all connected to one business name.
// Positions are percentages of a 100 x 96 box so the labels keep a readable size at any width.
const NODES = [
  { icon: Envelope, label: "Business email", x: 28, y: 13 },
  { icon: CalendarBlank, label: "Calendar", x: 72, y: 13 },
  { icon: VideoCamera, label: "Video meetings", x: 88, y: 48 },
  { icon: FolderSimple, label: "Shared files", x: 72, y: 83 },
  { icon: MapPin, label: "Google Business profile", x: 28, y: 83 },
  { icon: Browser, label: "Your website", x: 12, y: 48 },
];

export default function PresenceArt() {
  return (
    <div
      role="img"
      aria-label="Business email, calendar, video meetings, shared files, a Google Business profile and a website, all connected to one business name"
      className="relative mx-auto aspect-[100/96] w-full max-w-[26rem]"
    >
      <svg aria-hidden="true" viewBox="0 0 100 96" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {NODES.map((n) => (
          <line
            key={n.label}
            x1="50"
            y1="48"
            x2={n.x}
            y2={n.y}
            stroke="#101010"
            strokeOpacity="0.35"
            strokeWidth="1.25"
            strokeDasharray="4 8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-dash"
          />
        ))}
      </svg>

      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 sm:h-20 sm:w-20">
        <span className="absolute -inset-3 rounded-[2rem] border border-ink/30 animate-ping2" />
        <div className="relative grid h-full w-full place-items-center rounded-3xl bg-accent shadow-[0_24px_40px_-18px_rgba(16,16,16,0.55)] ring-1 ring-ink/20">
          <img src={LOGO_DARK} alt="" width={240} height={250} className="h-9 w-auto sm:h-10" />
        </div>
      </div>

      {NODES.map((n) => {
        const Icon = n.icon;
        return (
          <div
            key={n.label}
            aria-hidden="true"
            className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-ink shadow-[0_14px_26px_-14px_rgba(16,16,16,0.55)] ring-1 ring-ink/15 sm:h-14 sm:w-14">
              <Icon size={24} weight="regular" />
            </span>
            <span className="mt-1.5 rounded bg-paper2 px-1.5 py-0.5 text-[11px] leading-tight text-ink sm:text-xs">{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}
