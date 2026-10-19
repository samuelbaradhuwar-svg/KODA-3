// Lists the business details and sign-offs still missing before the legal pages can be treated as final.
// Run: npm run legal:check   (exits 1 while anything is missing)
import { BUSINESS, LEGAL } from "../src/legal-config.js";

const required = [
  ["legalName", "Registered name (or your full name if you trade as a sole proprietor)"],
  ["entityType", "Type of business (sole proprietor, Pty Ltd, close corporation)"],
  ["physicalAddress", "A physical business address (required for online sellers under ECTA section 43)"],
  ["informationOfficer", "Information Officer (POPIA); for a sole proprietor this is the owner"],
];
const optional = [
  ["registrationNumber", "CIPC registration number (if registered)"],
  ["vatNumber", "VAT number (only if VAT registered)"],
  ["phone", "Phone number (optional)"],
];

const missing = required.filter(([k]) => !String(BUSINESS[k] || "").trim());
const notes = optional.filter(([k]) => !String(BUSINESS[k] || "").trim());

console.log("Business details (src/legal-config.js, BUSINESS):");
for (const [, label] of missing) console.log(`  MISSING  ${label}`);
for (const [, label] of notes) console.log(`  not set  ${label}`);
console.log(`\nAttorney review (src/legal-config.js, LEGAL.reviewed): ${LEGAL.reviewed ? "done" : "NOT DONE, the legal pages show a draft notice"}`);

if (missing.length || !LEGAL.reviewed) {
  console.log("\nNot ready to publish as final.");
  process.exit(1);
}
console.log("\nReady.");
