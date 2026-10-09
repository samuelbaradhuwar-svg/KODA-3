import React from "react";
import { renderToString } from "react-dom/server";
import App, { PAGES } from "./App.jsx";

export const pages = PAGES;

export function render(path) {
  return renderToString(
    <React.StrictMode>
      <App path={path} />
    </React.StrictMode>
  );
}
