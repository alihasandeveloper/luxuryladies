/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E91E63",
          hover: "#C2185B",
        },
        accent: "#FF4081",
        secondary: "#F8BBD0",
        dark: "#191426",
        text: "#191426",
        description: "#6F6470",
        bg: "#FFF5F7",
        border: "#E8E2E5",
        error: "#E53935",
        success: "#2E7D32",
      },
      borderRadius: {
        none: "0px",
        md: "6px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
