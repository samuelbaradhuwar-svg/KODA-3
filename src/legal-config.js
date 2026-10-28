// Business details shown in the footer and on the legal pages. Only fields that are filled in appear.
// Fill these in with the details that are true for the business, exactly as registered. Nothing here is guessed.
// `npm run legal:check` lists what is still missing.
export const BUSINESS = {
  tradingName: "KODA",
  legalName: "", // the registered name or your full name if you trade as a sole proprietor, e.g. "Jane Doe t/a KODA"
  entityType: "", // e.g. "Sole proprietor", "Private company (Pty) Ltd", "Close corporation"
  registrationNumber: "", // CIPC registration number, if registered
  vatNumber: "", // only if VAT registered
  physicalAddress: "", // a business address where documents can be served (not a home address you want to keep private)
  postalAddress: "", // optional
  email: "hello@heykoda.co.za",
  phone: "061 244 0166", // optional
  informationOfficer: "", // the person responsible for POPIA compliance (for a sole proprietor, the owner)
  informationOfficerEmail: "hello@heykoda.co.za",
};

// The legal pages show a "draft" notice until this is true. Set it to true only after an attorney has reviewed
// the four policies and the details above are complete.
export const LEGAL = {
  reviewed: false,
  // Set to true once the Information Officer is registered with the Information Regulator (not shown on the site).
  informationOfficerRegistered: false,
  updated: "19 October 2026",
};

export const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms and conditions", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
  { label: "Cookie policy", href: "/cookie-policy" },
];
