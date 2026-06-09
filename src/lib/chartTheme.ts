export const CHART_THEME = {
  grid:  'rgba(255,255,255,0.05)',
  tick:  'hsl(260 15% 55%)',
  tooltip: {
    contentStyle: {
      background: 'hsl(265 22% 16%)',
      border:     '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      color:       'hsl(280 20% 97%)',
      fontSize:    '12px',
    },
    itemStyle: { color: 'hsl(280 20% 97%)' },
    labelStyle: { color: 'hsl(260 15% 65%)', fontWeight: 600 },
  },
  colors: {
    primary:     'hsl(273 80% 65%)',
    accent:      'hsl(322 88% 66%)',
    success:     'hsl(158 70% 52%)',
    warning:     'hsl(38 95% 62%)',
    destructive: 'hsl(350 85% 62%)',
    info:        'hsl(192 90% 65%)',
    muted:       'hsl(260 15% 35%)',
  },
  legend: { color: 'hsl(260 15% 55%)' },
} as const
