import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Command from "./pages/Command.jsx";

// The private pages (/command and, later, /report/:token) are their own entry so none of the public site loads here.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Command />
  </React.StrictMode>
);
