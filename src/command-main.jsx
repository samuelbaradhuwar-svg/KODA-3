import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ReportPage from "./pages/Report.jsx";

// Two private pages share this entry: /report/<token> (a client's report, no sign-in) and /command (the owner's tool).
// The owner's tool loads on its own, so a client opening a report never downloads the sign-in code.
const Command = lazy(() => import("./pages/Command.jsx"));
const isReport = window.location.pathname.startsWith("/report/");

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isReport ? (
      <ReportPage />
    ) : (
      <Suspense fallback={<p className="p-10 text-muted">Loading…</p>}>
        <Command />
      </Suspense>
    )}
  </React.StrictMode>
);
