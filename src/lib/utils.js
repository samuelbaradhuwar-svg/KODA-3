export const EMAIL = "hello@heykoda.co.za";

// The phone line shows wherever PHONE.digits is set (digits only, with country code). The WhatsApp button and link are a
// separate switch: set whatsapp to true to turn them on. They are off for now.
export const PHONE = { digits: "27612440166", display: "061 244 0166", whatsapp: false };

import { smoothScrollTo } from "./smooth.js";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) smoothScrollTo(el);
  else window.location.assign(`/#${id}`);
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function composeUrl({ subject = "Website enquiry", body = "" } = {}) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
}

// On desktop a plain mailto: link often opens nothing useful, so open a Gmail compose window instead.
// On phones, and with JavaScript off, the normal mailto: link still opens the visitor's own mail app.
export function openCompose(opts = {}) {
  const { subject = "Website enquiry", body = "" } = opts;
  if (isMobile()) {
    window.location.href = composeUrl(opts);
    return;
  }
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openGmailCompose(e) {
  if (isMobile()) return;
  e.preventDefault();
  openCompose();
}
