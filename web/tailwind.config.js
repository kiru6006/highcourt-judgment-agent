/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          darkCanvas: '#0F172A',
          darkCard: '#1E293B',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          darkPrimary: '#F1F5F9',
          darkSecondary: '#94A3B8',
        },
        amber: {
          highlight: '#B45309',
          soft: '#FEF3C7',
          darkHighlight: '#F59E0B',
        },
        verified: {
          badge: '#047857',
          soft: '#D1FAE5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
