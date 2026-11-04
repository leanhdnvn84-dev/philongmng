import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      colors: {
        // deep navy brand + champagne gold accent
        navy: { 50: '#f2f5fa', 100: '#e3e9f3', 200: '#c4d0e4', 300: '#94a8cb', 400: '#5f78a8', 500: '#3d5689', 600: '#2c416f', 700: '#22335a', 800: '#172440', 900: '#0f1a30', 950: '#0a1222' },
        gold: { 50: '#fbf7ec', 100: '#f5ebcc', 200: '#ead59a', 300: '#dcbb67', 400: '#cfa548', 500: '#b88a32', 600: '#986d29', 700: '#795424' },
        ink: { DEFAULT: '#1b2333', soft: '#4a5468', mute: '#7a8396' },
        canvas: '#f5f6f9',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,26,48,.04), 0 4px 16px -4px rgba(15,26,48,.08)',
        pop: '0 12px 40px -8px rgba(15,26,48,.28)',
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
    },
  },
  plugins: [],
}
export default config
