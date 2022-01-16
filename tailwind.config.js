const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      spacing: {
        navbar: "56px",
        sidebar: "150px",
      },
      colors: {
        primary: "#00462A",
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
