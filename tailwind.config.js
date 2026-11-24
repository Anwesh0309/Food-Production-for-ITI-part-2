/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Module 2 identity: Blue & White (Sapphire / Royal Blue + Clean White + Navy)
        saffron: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        cream: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
        },
        ink: {
          0: '#070d18',
          1: '#0f172a',
          2: '#1e293b',
          3: '#334155',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        herb: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        chili: { 500: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: { 'rise': 'rise .35s ease-out both', 'steam': 'steam 3s ease-in-out infinite' },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        steam: { '0%,100%': { opacity: '.25', transform: 'translateY(0)' }, '50%': { opacity: '.7', transform: 'translateY(-5px)' } },
      },
    },
  },
  plugins: [],
};
