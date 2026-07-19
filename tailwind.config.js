/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D12",
        paper: "#FAFAF8",
        surface: "#FFFFFF",
        line: "#E7E7E2",
        muted: "#6B7075",
        accent: {
          DEFAULT: "#E4572E",
          hover: "#C74821",
          soft: "#FDEEE7"
        },
        success: "#1E8E5A",
        warn: "#B45309"
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,13,18,0.04), 0 8px 24px -12px rgba(11,13,18,0.12)",
        pop: "0 20px 60px -20px rgba(11,13,18,0.35)",
        bar: "0 -8px 24px -8px rgba(11,13,18,0.15)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideUp: { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        slideDown: { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(100%)" } },
        pulseSoft: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } }
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out both",
        fadeInUp: "fadeInUp 0.6s ease-out both",
        slideUp: "slideUp 0.3s ease-out both",
        slideDown: "slideDown 0.3s ease-in both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        marquee: "marquee 18s linear infinite"
      }
    }
  },
  plugins: []
};
