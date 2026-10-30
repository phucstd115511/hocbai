/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        neu: {
          bg: '#EBECF0',
          surface: '#EBECF0',
          fg: '#4A5568',
          heading: '#2D3748',
          muted: '#718096',
          subtle: '#A0AEC0',
          accent: '#FF8800',
          'accent-hover': '#E07700',
          'accent-light': '#FFA333',
          secondary: '#E2E8F0',
          darkBg: '#1A1E24',
          darkSurface: '#1A1E24',
          darkFg: '#E2E8F0',
          darkHeading: '#F7FAFC',
          darkMuted: '#94A3B8',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF8800',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      borderRadius: {
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
