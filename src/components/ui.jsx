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
      className={cn("reveal", className)}
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
    <p className={cn("flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em]", light ? "text-paper/60" : "text-muted", className)}>
      <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-[3px] bg-accent", !light && "ring-1 ring-ink/50")} />
      {children}
    </p>
  );
}

// Section headlines. Each word rises out of a clipping box as the heading scrolls into view. When the text
// contains an <em>, the words outside it are greyed back and the <em> words stay in full ink, the same pattern
// as the hero statements. Visible by default (server render, or if scripts fail); only headings that start
// below the fold are hidden and then revealed.
const textOf = (node) =>
  React.Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : React.isValidElement(c) ? textOf(c.props.children) : ""))
    .join("");

export function Headline({ as: Tag = "h2", className, light = false, children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setShown(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const parts = React.Children.toArray(children);
  const hasEm = parts.some((c) => React.isValidElement(c) && c.type === "em");
  const soft = light ? "text-paper/50" : "text-ink/55";
  let n = 0;
  const words = [];
  const add = (text, strong) => {
    text.split(/\s+/).filter(Boolean).forEach((w) => {
      const i = n++;
      words.push(
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span className="rise" aria-hidden="true">
            <span
              className={cn("rise-in", hasEm && !strong && soft, hasEm && strong && light && "text-accent")}
              style={{ transform: shown ? "none" : "translate3d(0,115%,0)", transitionDelay: `${i * 55}ms` }}
            >
              {w}
            </span>
          </span>
        </React.Fragment>
      );
    });
  };
  parts.forEach((c) => {
    if (typeof c === "string") add(c, false);
    else if (React.isValidElement(c)) add(textOf(c.props.children), c.type === "em");
  });
  return (
    <Tag ref={ref} className={className} aria-label={textOf(children)}>
      {words}
    </Tag>
  );
}

const btnBase =
  "group inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full py-3 pl-6 pr-3 text-sm font-medium transition-[background,color,transform] duration-300 active:scale-[0.98]";

export function Button({ children, onClick, href, onClickCapture, variant = "dark", className, type }) {
  // dark: black pill for light backgrounds. lime: the accent pill for black backgrounds. light: paper pill.
  const styles = {
    dark: "bg-ink text-paper hover:bg-accent hover:text-ink",
    lime: "bg-accent text-ink hover:bg-paper",
    light: "bg-paper text-ink hover:bg-accent",
  }[variant];
  const arrowStyles = {
    dark: "bg-paper text-ink group-hover:bg-ink group-hover:text-accent",
    lime: "bg-ink text-accent",
    light: "bg-ink text-paper group-hover:text-accent",
  }[variant];
  const arrow = (
    <span className={cn("grid h-8 w-8 place-items-center rounded-full transition-[transform,background,color] duration-300 group-hover:translate-x-0.5", arrowStyles)}>
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
      className={cn("group inline-flex min-h-11 items-center text-sm font-medium", light ? "text-paper" : "text-ink", className)}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border-b pb-0.5 transition-colors",
          light ? "border-paper/40 group-hover:border-paper" : "border-ink/40 group-hover:border-ink"
        )}
      >
        {children}
        <ArrowUpRight size={15} weight="bold" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
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
export function BrowserFrame({ project, className, priority = false, high = false }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-white shadow-[0_40px_70px_-30px_rgba(16,16,16,0.45)] ring-1 ring-ink/10", className)}>
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
        fetchPriority={high ? "high" : undefined}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
