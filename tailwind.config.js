/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {colors: {
    card: "#ffffff",
    "card-foreground": "#0f172a",
    destructive: "#ef4444",
    "muted-foreground": "#6b7280",
    muted: "#f3f4f6",
    primary: "#6366f1",
    "primary-foreground": "#ffffff",

    secondary: "#f3f4f6",
    "secondary-foreground": "#111827",

    foreground: "#111827",
    background: "#ffffff",

    accent: "#f3f4f6",
    "accent-foreground": "#111827",
    popover: "#ffffff",
    "popover-foreground": "#111827",
    border: "#e5e7eb",
    ring: "#e5e7eb",
    input: "#e5e7eb",
    "input-background": "#ffffff",
    sidebar: "#ffffff",
    "sidebar-foreground": "#111827",
    "sidebar-border": "#e5e7eb",
    "sidebar-accent": "#f3f4f6",
    "sidebar-accent-foreground": "#111827",
    "switch-background": "#e5e7eb",
  },
},
  },
  plugins: [require("tailwindcss-animate")],
};
