/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Black and off-white. The orange accent is retired: emphasis now comes from weight, size and contrast.
        paper: "#F6F5F1",
        paper2: "#ECEBE6",
        ink: "#0A0A0B",
        ink2: "#17171A",
        muted: "#5C5B57",
        accent: "#0A0A0B",
        accentDeep: "#2A2A2E",
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
