/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0D7A6A',
          hover: '#0A6358',
          light: '#E8F5F2',
        },
        cta: {
          DEFAULT: '#E07B00',
          hover: '#C46A00',
          light: '#FFF3E0',
          text: '#B35C00',
        },
        bg: {
          page: '#F5FAFA',
          card: '#FFFFFF',
          'card-hover': '#EEF8F6',
          navbar: 'rgba(245, 250, 250, 0.92)',
        },
        text: {
          heading: '#0D1F1C',
          body: '#1E3D38',
          secondary: '#3A6A62',
          muted: '#5A8A80',
          'on-primary': '#FFFFFF',
        },
        border: {
          subtle: '#C8E6E2',
          default: '#9ECFC8',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
