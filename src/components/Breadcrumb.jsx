import React from "react";
import { cn } from "../lib/utils.js";

// "Home / Website design in Durban / Pinetown": the trail from src/trail.js.
export default function Breadcrumb({ trail, className }) {
  if (!trail || trail.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-8 text-[13px] text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((c, i) =>
          i < trail.length - 1 ? (
            <React.Fragment key={c.path}>
              <li><a className="underline-offset-4 hover:underline" href={c.path}>{c.name}</a></li>
              <li aria-hidden="true">/</li>
            </React.Fragment>
          ) : (
            <li key={c.path} aria-current="page" className="text-ink">{c.name}</li>
          )
        )}
      </ol>
    </nav>
  );
}
