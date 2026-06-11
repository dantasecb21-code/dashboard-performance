export const CHART_THEME = {
  grid:  'rgba(0,0,0,0.06)',
  tick:  '#94A3B8',
  tooltip: {
    contentStyle: {
      background:   '#FFFFFF',
      border:       '1px solid #E2E8F0',
      borderRadius: '10px',
      color:        '#0F172A',
      fontSize:     '12px',
      boxShadow:    '0 4px 16px -4px rgba(15,23,42,0.12)',
    },
    itemStyle:  { color: '#334155' },
    labelStyle: { color: '#0891B2', fontWeight: 600 },
  },
  colors: {
    primary:     'hsl(192 91% 36%)',
    accent:      'hsl(217 91% 60%)',
    success:     'hsl(142 72% 29%)',
    warning:     'hsl(32 95% 44%)',
    destructive: 'hsl(0 72% 51%)',
    info:        'hsl(217 91% 60%)',
    muted:       '#CBD5E1',
  },
  legend: { color: '#64748B' },
} as const
