// ===== tailwind.config.js =====
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        islamic: {
          green: '#2d5016',
          gold: '#d4af37',
          blue: '#1e40af',
          cream: '#f7f3e9',
        }
      },
      fontFamily: {
        'arabic': ['Amiri', 'Arabic UI Text', 'serif'],
      },
      animation: {
        'prayer-bead': 'prayer-bead 2s ease-in-out infinite',
      },
      keyframes: {
        'prayer-bead': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}