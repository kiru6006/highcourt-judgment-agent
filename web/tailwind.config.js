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
        legal: {
          navy: {
            950: '#060F1E',
            900: '#0C1E3C', // Primary Header & Authority
            800: '#142C54',
            700: '#1E3A8A',
            100: '#E8F0FE',
            50: '#F0F4FA',
          },
          brass: {
            700: '#92400E', // Accent, CTA & Active Anchors
            600: '#B45309',
            500: '#D97706',
            100: '#FEF3C7',
            50: '#FFFBEB',
          },
          parchment: {
            DEFAULT: '#FAF9F6', // Judicial Reading Canvas
            card: '#FFFFFF',
            border: '#E2E8F0',
            dark: '#0B111E',
            darkCard: '#131B2A',
          },
          ink: {
            900: '#111827', // Pitch-black crisp judicial text
            800: '#1E293B',
            700: '#334155', // Subheadings
            600: '#475569', // Accessible Secondary (5.8:1 ratio)
            500: '#64748B', // WCAG AAA compliant metadata
          },
          outcome: {
            allowed: '#047857',
            allowedBg: '#ECFDF5',
            dismissed: '#991B1B',
            dismissedBg: '#FEF2F2',
            disposed: '#854D0E',
            disposedBg: '#FEFCE8',
          }
        },
        paper: {
          canvas: '#FAF9F6',
          card: '#FFFFFF',
          darkCanvas: '#0B111E',
          darkCard: '#131B2A',
        },
        ink: {
          primary: '#111827',
          secondary: '#334155',
          muted: '#475569',
          darkPrimary: '#F8FAFC',
          darkSecondary: '#CBD5E1',
        },
        amber: {
          highlight: '#92400E',
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
        serif: ['"EB Garamond"', 'Merriweather', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
