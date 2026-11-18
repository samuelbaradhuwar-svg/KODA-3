import React from "react";
import { renderToString } from "react-dom/server";
import App, { PAGES } from "./App.jsx";

export const pages = PAGES;
export { PLANS, MONTHLY_PLANS } from "./content.js";
export { trailFor } from "./trail.js";
export { FAQS, DURBAN_FAQS, DEV_FAQS, WORK_FAQS, ECOM_FAQS, STORE_FROM, PROJECTS } from "./content.js";
export { isIndexed, routedTowns, townPath, townMeta, townProblems, TOWN_SHARED_FAQS } from "./towns.js";

export function render(path) {
  return renderToString(
    <React.StrictMode>
      <App path={path} />
    </React.StrictMode>
  );
}
