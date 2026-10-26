// South African numbers: 031 555 0123, +27 31 555 0123 and 0027315550123 become tel: and WhatsApp links.
// A number that does not look like a South African number gets no WhatsApp link, so a message never goes to a stranger.
export const telHref = (p) => {
  const d = String(p || "").replace(/[^\d+]/g, "");
  return d.replace(/\D/g, "").length >= 9 ? `tel:${d}` : "";
};

export const waNumber = (p) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("0027")) d = d.slice(2);
  if (d.startsWith("27") && d.length >= 11 && d.length <= 12) return d;
  if (d.startsWith("0") && d.length >= 9 && d.length <= 11) return `27${d.slice(1)}`;
  return "";
};
