import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3b56e8',
          700: '#2d44d0',
        },
        success: { DEFAULT: '#16a34a', light: '#dcfce7', text: '#15803d' },
        warning: { DEFAULT: '#d97706', light: '#fef9c3', text: '#92400e' },
        danger:  { DEFAULT: '#dc2626', light: '#fee2e2', text: '#991b1b' },
        neutral: { DEFAULT: '#6b7280', light: '#f3f4f6', text: '#374151' },
      },
    },
  },
  plugins: [],
}
export default config
