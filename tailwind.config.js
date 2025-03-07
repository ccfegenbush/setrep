module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "whoop-dark": "#1A2A34",
        "whoop-card": "#2E3B45",
        "whoop-secondary": "#3B4A54", // New secondary contrast
        "whoop-green": "#39FF14",
        "whoop-cyan": "#00D4FF",
        "whoop-white": "#FFFFFF",
        "whoop-gray": "#B0B8C1",
      },
      fontFamily: {
        sans: ["Avenir Next", "SF Pro", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 10px rgba(57, 255, 20, 0.3)",
      },
    },
  },
  plugins: [],
};
