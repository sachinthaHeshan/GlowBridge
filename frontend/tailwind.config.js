/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional beauty industry palette inspired by real salon data
        primary: {
          50: '#fef7ee',
          100: '#fdebd7',
          200: '#fbd4ae',
          300: '#f7b27a',
          400: '#f38744',
          500: '#e9af00', // Golden amber from real salon data
          600: '#d19900',
          700: '#ba3a14',
          800: '#942f17',
          900: '#772915',
        },
        secondary: {
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
        },
        // Salon-specific colors from real data
        beauty: {
          cream: '#ffffff',     // Background cream
          gold: '#e9af00',      // Primary gold accent  
          red: '#da0000',       // Accent red
          gray: '#f5f5f5',      // Light gray
          'dark-gray': '#6d6d6d', // Medium gray
          charcoal: '#212529',   // Dark text
          black: '#000000',      // Pure black
        },
        // Enhanced color palette
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#e9af00', // Primary gold
          600: '#d19900',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        }
      },
      fontFamily: {
        // Enhanced typography based on real salon data
        sans: ['Poppins', 'system-ui', 'sans-serif'], // Primary font (most used)
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Professional sizing based on real salon usage
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }], // Most common size
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
        '6xl': ['60px', { lineHeight: '1' }],
      },
      fontWeight: {
        light: '300',
        normal: '400', // Most common weight
        medium: '500',
        semibold: '600',
        bold: '700', // Second most common
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'beauty': '0 4px 6px -1px rgba(233, 175, 0, 0.1), 0 2px 4px -1px rgba(233, 175, 0, 0.06)',
        'beauty-lg': '0 10px 15px -3px rgba(233, 175, 0, 0.1), 0 4px 6px -2px rgba(233, 175, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
