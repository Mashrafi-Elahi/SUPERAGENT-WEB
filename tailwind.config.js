/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bkash: { DEFAULT: '#E2136E', dark: '#B8005A', light: '#FF4D9D' },
        nagad: { DEFAULT: '#EF6C00', dark: '#C45A00', light: '#FF9A3C' },
        rocket: { DEFAULT: '#5C2D91', dark: '#3E1A6B', light: '#8B5CF6' },
        bg: {
          base: '#09090F',
          surface: '#111118',
          card: '#16161F',
          hover: '#1E1E2A',
          border: '#2A2A3A',
        },
        text: {
          primary: '#F0F0F5',
          secondary: '#8888AA',
          muted: '#55556A',
        },
        critical: { DEFAULT: '#FF3B3B', bg: '#2D0A0A' },
        high: { DEFAULT: '#FF8C00', bg: '#2D1800' },
        medium: { DEFAULT: '#FFD700', bg: '#2D2500' },
        low: { DEFAULT: '#00C851', bg: '#0A2D15' },
        fresh: '#00C851',
        stale: '#FFD700',
        missing: '#FF3B3B',
        conflicting: '#FF8C00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        bangla: ['"Noto Sans Bengali"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(226,19,110,0.3)',
        critical: '0 0 16px rgba(255,59,59,0.25)',
        high: '0 0 16px rgba(255,140,0,0.2)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};