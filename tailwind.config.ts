// tailwind.config.ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        keeper: { navy: '#1A3C5E', blue: '#2A7FBF', blueLight: '#D6E9F5' },
      },
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
