export function getChartTheme(isDark = false) {
  return {
    grid:  isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    tick:  isDark ? '#8B96A7' : '#64748B',
    tooltip: {
      contentStyle: {
        background:   isDark ? 'hsl(222 47% 13%)' : '#FFFFFF',
        border:       isDark ? '1px solid hsl(214 32% 22%)' : '1px solid #E2E8F0',
        borderRadius: '10px',
        color:        isDark ? 'hsl(210 22% 94%)' : '#0F172A',
        fontSize:     '12px',
        fontWeight:   500,
        boxShadow:    isDark
          ? '0 8px 24px -6px rgba(0,0,0,0.5)'
          : '0 8px 24px -6px rgba(15,23,42,0.14)',
      },
      itemStyle:  { color: isDark ? '#A8B5C8' : '#334155', fontWeight: 500 },
      labelStyle: { color: isDark ? '#38BDF8' : '#0891B2', fontWeight: 700 },
    },
    colors: {
      primary:     'hsl(192 91% 36%)',
      accent:      'hsl(217 91% 60%)',
      success:     'hsl(142 72% 29%)',
      warning:     'hsl(32 95% 44%)',
      destructive: 'hsl(0 72% 51%)',
      info:        'hsl(217 91% 60%)',
      muted:       isDark ? '#4B5563' : '#CBD5E1',
    },
    legend: { color: isDark ? '#8B96A7' : '#64748B' },
  } as const
}

export type ChartTheme = ReturnType<typeof getChartTheme>
