import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = document.getElementById("root");
const app = (
  <React.StrictMode>
    <App path={window.location.pathname.replace(/\/+$/, "") || "/"} />
  </React.StrictMode>
);

// The production build ships pre-rendered HTML (see scripts/prerender.mjs), so hydrate it when present.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
