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
        600: "#41474C",
        700: "#2E363A",
        800: "#1E2427",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    // themes: [
    //   {
    //     mytheme: {
    //       "--fallback-b1": "#171B1C",
    //       "--fallback-bc": "#FDFDFD",
    //     },
    //   },
    // ],
  },
} satisfies Config;
