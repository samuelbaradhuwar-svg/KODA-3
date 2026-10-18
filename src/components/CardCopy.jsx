import React from "react";

// One layout for the copy on every card: an icon tile, the title and a short description, all centred.
// `tone` is the card's surface: "paper" and "ink" cards carry an acid-green tile, an acid-green card carries an ink one.
const TILE = {
  paper: "bg-accent text-ink",
  ink: "bg-accent text-ink",
  accent: "bg-ink text-accent",
};

export default function CardCopy({ icon: Icon, title, desc, tone = "paper", className = "" }) {
  const dark = tone === "ink";
  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-4 p-7 text-center sm:gap-5 sm:p-10 [@media(max-height:520px)]:gap-2 [@media(max-height:520px)]:p-4 ${className}`}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl [@media(max-height:520px)]:h-10 [@media(max-height:520px)]:w-10 ${TILE[tone]}`}>
        {Icon ? <Icon size={26} weight="bold" aria-hidden="true" /> : null}
      </span>
      <h3 className="xwide text-[clamp(1.3rem,3vw,2.1rem)] leading-[1.05] tracking-[-0.03em] [@media(max-height:520px)]:text-[1.1rem]">{title}</h3>
      <p className={`max-w-[38ch] text-[clamp(15px,1.4vw,17px)] leading-[1.6] [@media(max-height:520px)]:text-[13px] [@media(max-height:520px)]:leading-[1.45] ${dark ? "text-paper/70" : "text-ink/75"}`}>{desc}</p>
    </div>
  );
}
