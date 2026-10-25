/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./command.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral black and white with one lime accent (the streetwear reference). Lime is used as a fill, a highlight on
        // dark backgrounds and for small marks, never as body text on light backgrounds.
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        paper2: "rgb(var(--c-paper2) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        ink2: "rgb(var(--c-ink2) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        accent: "#BDF64F",
        accentDeep: "#9BD02D",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        marquee: { from: { transform: "translate3d(0,0,0)" }, to: { transform: "translate3d(-50%,0,0)" } },
        float: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-8px,0)" } },
        dash: { to: { strokeDashoffset: "-24" } },
        ping2: { "75%,100%": { transform: "scale(2.2)", opacity: "0" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out -3s infinite",
        dash: "dash 1.6s linear infinite",
        ping2: "ping2 2.2s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
