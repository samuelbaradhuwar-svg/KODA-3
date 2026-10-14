/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EEE6",
        paper2: "#E9E3D6",
        ink: "#16150F",
        ink2: "#211F18",
        muted: "#6C675A",
        accent: "#D9532B",
        accentDeep: "#B8431F",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        marquee: { from: { transform: "translate3d(0,0,0)" }, to: { transform: "translate3d(-50%,0,0)" } },
        float: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-8px,0)" } },
        ping2: { "75%,100%": { transform: "scale(2.2)", opacity: "0" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out -3s infinite",
        ping2: "ping2 2.2s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
