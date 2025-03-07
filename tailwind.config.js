module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "whoop-dark": "#1A2A34",
        "whoop-card": "#2E3B45",
        "whoop-green": "#39FF14",
        "whoop-cyan": "#00D4FF",
        "whoop-white": "#FFFFFF",
        "whoop-gray": "#B0B8C1",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        montserrat: ["var(--font-montserrat)", "sans-serif"], // Add Montserrat
      },
      boxShadow: {
        glow: "0 0 10px rgba(57, 255, 20, 0.3)",
      },
    },
  },
  plugins: [],
};
