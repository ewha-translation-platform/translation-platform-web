const colors = require("tailwindcss/colors");

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      spacing: {
        navbar: "var(--navbar-height)",
        sidebar: "var(--sidebar-width)",
      },
      colors: {
        primary: withOpacityValue("--primary-color"),
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
