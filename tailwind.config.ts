/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        brand: {
          900: '#0f172a',
          700: '#1d4ed8',
          500: '#2563eb',
          300: '#60a5fa',
        },
        mint: {
          500: '#15b79e',
        }
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.5rem',
      },
      fontSize: {
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        hero: ['clamp(1.75rem, 3.5vw, 3.75rem)', { lineHeight: '1.05' }],
      }
    },
  },
  plugins: [],
}
