import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initSmoothScroll } from "./lib/smooth.js";

const root = document.getElementById("root");
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const app = (
  <React.StrictMode>
    <App path={path} />
  </React.StrictMode>
);

// KODA Autopilot pages (/admin, /onboarding) are served the home page's HTML shell but are not pre-rendered,
// so they render fresh. Every other page ships pre-rendered HTML (see scripts/prerender.mjs), so hydrate it.
const standalone = path === "/admin" || path === "/onboarding";
if (standalone) {
  root.textContent = "";
  createRoot(root).render(app);
} else {
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
  initSmoothScroll();
}
