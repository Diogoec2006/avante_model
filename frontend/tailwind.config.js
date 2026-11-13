/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        avante: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c', // Rojo carmesí corporativo
          800: '#9f1239', // Rojizo oscuro elegante
          900: '#881337',
          dark: '#4c0519',
        },
        plomo: {
          50: '#f8fafc',
          100: '#f1f5f9', // Plomito de fondo
          200: '#e2e8f0', // Plomito de bordes
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155', // Plomo texto secundario
          800: '#1e293b', // Plomo grafito
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
