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
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sidebar: {
          bg:     '#0f172a',
          hover:  '#1e293b',
          active: '#1d4ed8',
          border: '#1e293b',
          text:   '#94a3b8',
          textActive: '#ffffff',
        },
        success: { DEFAULT: '#16a34a', light: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
        warning: { DEFAULT: '#d97706', light: '#fffbeb', text: '#92400e', border: '#fde68a' },
        danger:  { DEFAULT: '#dc2626', light: '#fef2f2', text: '#991b1b', border: '#fecaca' },
        neutral: { DEFAULT: '#64748b', light: '#f8fafc', text: '#334155' },
        amber:   { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
        'sidebar': '1px 0 0 0 #1e293b',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
export default config
