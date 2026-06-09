export const CHART_THEME = {
  grid:  'rgba(255,255,255,0.04)',
  tick:  'hsl(218 18% 46%)',
  tooltip: {
    contentStyle: {
      background:   'hsl(220 52% 7%)',
      border:       '1px solid hsl(220 40% 20%)',
      borderRadius: '10px',
      color:        'hsl(210 22% 96%)',
      fontSize:     '12px',
    },
    itemStyle:  { color: 'hsl(210 22% 96%)' },
    labelStyle: { color: 'hsl(177 100% 55%)', fontWeight: 600 },
  },
  colors: {
    primary:     'hsl(177 100% 41%)',
    accent:      'hsl(74 100% 50%)',
    success:     'hsl(143 78% 46%)',
    warning:     'hsl(26 100% 58%)',
    destructive: 'hsl(349 100% 61%)',
    info:        'hsl(207 90% 63%)',
    muted:       'hsl(218 18% 30%)',
  },
  legend: { color: 'hsl(218 18% 50%)' },
} as const
