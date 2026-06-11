import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semântico (CSS vars) ── */
        background:          'hsl(var(--background))',
        foreground:          'hsl(var(--foreground))',
        card:                'hsl(var(--card))',
        'card-foreground':   'hsl(var(--card-foreground))',
        'muted-foreground':  'hsl(var(--muted-foreground))',
        border:              'hsl(var(--border))',
        primary:             'hsl(var(--primary))',
        accent:              'hsl(var(--accent))',
        success:             'hsl(var(--success))',
        warning:             'hsl(var(--warning))',
        destructive:         'hsl(var(--destructive))',
        info:                'hsl(var(--info))',

        /* ── Mantidos para compat ── */
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
          bg:         '#0f172a',
          hover:      '#1e293b',
          active:     '#1d4ed8',
          border:     '#1e293b',
          text:       '#94a3b8',
          textActive: '#ffffff',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        sans:    ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 6px 16px 0 rgb(0 0 0 / 0.12), 0 2px 6px -1px rgb(0 0 0 / 0.06)',
        'glass':      '0 8px 30px -4px rgb(15 23 42 / 0.18), 0 2px 8px -2px rgb(15 23 42 / 0.10)',
        'sidebar':    '1px 0 0 0 #1e293b',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
export default config
