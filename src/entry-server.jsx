import React from "react";
import { renderToString } from "react-dom/server";
import App, { PAGES } from "./App.jsx";

export const pages = PAGES;
export { FAQS, DURBAN_FAQS, DEV_FAQS, WORK_FAQS, ECOM_FAQS, STORE_FROM, PROJECTS } from "./content.js";
export { routedTowns, townPath, townMeta, townProblems, TOWN_SHARED_FAQS } from "./towns.js";

export function render(path) {
  return renderToString(
    <React.StrictMode>
      <App path={path} />
    </React.StrictMode>
  );
}
