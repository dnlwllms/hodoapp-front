import daisyui from "daisyui";

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      gray: {
        100: "#FDFDFD",
        300: "#C5C8CE",
        400: "#999FA4",
        500: "#5A6166",
        600: "#41474C",
        700: "#2E363A",
        800: "#1E2427",
        900: "#171B1C",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#E1FF5A",
          "--fallback-bc": "#5A6166",
        },
      },
    ],
  },
} satisfies Config;
