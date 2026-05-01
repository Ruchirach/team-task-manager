/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate 900
        surface: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
        surfaceHover: 'rgba(30, 41, 59, 0.9)',
        primary: '#3b82f6', // Blue 500
        primaryHover: '#2563eb', // Blue 600
        textMain: '#f8fafc', // Slate 50
        textMuted: '#94a3b8', // Slate 400
        danger: '#ef4444', // Red 500
        success: '#22c55e', // Green 500
        warning: '#eab308', // Yellow 500
      },
    },
  },
  plugins: [],
}
