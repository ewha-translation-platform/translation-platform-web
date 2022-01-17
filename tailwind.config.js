const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      spacing: {
        navbar: "var(--navbar-height)",
        sidebar: "var(--sidebar-width)",
      },
      colors: {
        primary: "var(--primary-color)",
        secondary: colors.neutral,
        danger: colors.red[700],
      },
    },
    fontFamily: {
      sans: ['"Noto Sans KR"', "sans-serif"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("autoprefixer")],
};
