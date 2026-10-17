import React from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { PHONE } from "../lib/utils.js";

export default function WhatsApp() {
  if (!PHONE.digits) return null;
  return (
    <a
      href={`https://wa.me/${PHONE.digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fab fixed z-40 grid h-14 w-14 place-items-center rounded-full bg-ink text-paper shadow-[0_18px_40px_-14px_rgba(16,16,16,0.6)] transition-[transform,background] duration-300 hover:-translate-y-0.5 hover:bg-ink2 active:scale-[0.96]"
    >
      <WhatsappLogo size={26} weight="fill" />
    </a>
  );
}
