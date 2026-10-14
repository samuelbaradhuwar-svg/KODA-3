import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import LOGO_DARK from "../assets/koda-icon-black.webp";
import LOGO_LIGHT from "../assets/koda-icon-white.webp";
import { cn } from "../lib/utils.js";

// Content is visible by default (server render, or if scripts fail to load). Once running in the browser,
// only elements that start below the fold are hidden, then revealed as they scroll into view.
export function Reveal({ children, className, delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setVisible(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translate3d(0, 24px, 0)",
        transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, light = false, className }) {
  return (
    <p className={cn("flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]", light ? "text-paper/60" : "text-muted", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}

const btnBase =
  "group inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full py-3 pl-6 pr-3 text-sm font-medium transition-[background,color,transform] duration-300 active:scale-[0.98]";

export function Button({ children, onClick, href, onClickCapture, variant = "dark", className, type }) {
  const styles =
    variant === "light"
      ? "bg-paper text-ink hover:bg-accent hover:text-paper"
      : "bg-ink text-paper hover:bg-accent";
  const arrow = (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5",
        variant === "light" ? "bg-ink text-paper" : "bg-paper text-ink"
      )}
    >
      <ArrowRight size={16} weight="bold" />
    </span>
  );
  const cls = cn(btnBase, styles, className);
  if (href)
    return (
      <a href={href} onClick={onClick} className={cls}>
        {children}
        {arrow}
      </a>
    );
  return (
    <button type={type} onClick={onClick} onClickCapture={onClickCapture} className={cls}>
      {children}
      {arrow}
    </button>
  );
}

export function TextLink({ children, href, onClick, external, light, className }) {
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group inline-flex items-center gap-1.5 border-b pb-0.5 text-sm font-medium transition-colors",
        light ? "border-paper/40 text-paper hover:border-accent hover:text-accent" : "border-ink/40 text-ink hover:border-accent hover:text-accent",
        className
      )}
    >
      {children}
      <ArrowUpRight size={15} weight="bold" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export function Logo({ light = false, className }) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2.5", className)}>
      <img src={light ? LOGO_LIGHT : LOGO_DARK} alt="" width={240} height={250} className="h-8 w-auto" draggable={false} />
      <span className={cn("text-[1.15rem] font-semibold uppercase tracking-[-0.01em]", light ? "text-paper" : "text-ink")}>KODA</span>
    </span>
  );
}

// A real site screenshot inside a quiet browser window.
export function BrowserFrame({ project, className, priority = false }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-white shadow-[0_40px_70px_-30px_rgba(60,40,10,0.45)] ring-1 ring-ink/10", className)}>
      <div className="flex items-center gap-1.5 border-b border-ink/10 bg-paper px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="ml-2 truncate rounded bg-white px-2.5 py-1 font-mono text-[10px] leading-none text-muted ring-1 ring-ink/10">{project.host}</span>
      </div>
      <img
        src={project.src}
        alt={`${project.name} website`}
        width={project.width}
        height={project.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
