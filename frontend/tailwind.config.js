/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Allow manual dark mode toggle using the 'dark' class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
          3: "var(--paper-3)",
        },
        white: "var(--white)",
        green: {
          DEFAULT: "var(--green)",
          2: "var(--green-2)",
          bg: "var(--green-bg)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
        },
        rose: {
          DEFAULT: "var(--rose)",
          bg: "var(--rose-bg)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          bg: "var(--blue-bg)",
        },
        border: {
          DEFAULT: "var(--border)",
          md: "var(--border-md)",
        },
        /* Mapped standard names to root for easy adoption if old classes linger */
        background: "var(--paper)",
        foreground: "var(--ink)",
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: "22px",
        md: "14px",
        sm: "8px",
        full: "999px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(13,13,12,0.07), 0 1px 2px rgba(13,13,12,0.05)",
        md: "0 4px 16px rgba(13,13,12,0.09), 0 1px 4px rgba(13,13,12,0.06)",
        lg: "0 12px 40px rgba(13,13,12,0.11), 0 4px 12px rgba(13,13,12,0.07)",
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      spacing: {
        '5.5': '1.375rem',
      }
    },
  },
  plugins: [],
}
