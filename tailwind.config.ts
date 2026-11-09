import type { Config } from 'tailwindcss'

// Palette taken from PHILONG BUILDING V191 (Apps Script): brand red #ED3237,
// slate-navy text #172033, lines #e4e7ec, canvas #f4f6f8.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { soft: ['var(--font-soft)', 'var(--font-sans)', 'sans-serif'], sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'] },
      colors: {
        navy: { 50: '#f8fafc', 100: '#eef1f5', 200: '#e4e7ec', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1f2a3c', 900: '#172033', 950: '#0f1624' },
        brand: { 50: '#fef2f2', 100: '#fde3e3', 200: '#fbc5c6', 300: '#f6979a', 400: '#ED3237', 500: '#d92a2f', 600: '#b82227', 700: '#941c20' },
        select: { DEFAULT: '#eaf4ff', accent: '#2189e6' }, // selected table row, as in V191
        ink: { DEFAULT: '#1f2937', soft: '#475569', mute: '#667085' },
        canvas: '#e9eef7',
      },
      boxShadow: {
        card: '0 5px 0 #c5cfe3, 0 14px 24px rgba(11,27,64,.10)',
        pop: '0 12px 30px rgba(16,24,40,.16)',
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [],
}
export default config
