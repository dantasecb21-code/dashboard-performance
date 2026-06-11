export function getChartTheme(isDark = false) {
  return {
    grid:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.055)',
    tick:  isDark ? '#8896AA' : '#64748B',
    tooltip: {
      contentStyle: {
        background:   isDark ? 'hsl(217 22% 13%)' : '#FFFFFF',
        border:       isDark ? '1px solid hsl(215 25% 20%)' : '1px solid #E2E8F0',
        borderRadius: '10px',
        color:        isDark ? 'hsl(210 30% 93%)' : '#0F172A',
        fontSize:     '12px',
        fontWeight:   500,
        boxShadow:    isDark
          ? '0 8px 24px -6px rgba(0,0,0,0.55)'
          : '0 8px 24px -6px rgba(15,23,42,0.12)',
      },
      itemStyle:  { color: isDark ? '#9AAABB' : '#334155', fontWeight: 500 },
      labelStyle: { color: isDark ? 'hsl(192 65% 50%)' : '#0891B2', fontWeight: 700 },
    },
    colors: {
      primary:     isDark ? 'hsl(192 75% 42%)' : 'hsl(192 91% 36%)',
      accent:      isDark ? 'hsl(217 80% 58%)' : 'hsl(217 91% 60%)',
      success:     isDark ? 'hsl(142 60% 38%)' : 'hsl(142 72% 29%)',
      warning:     isDark ? 'hsl(32 85% 50%)' : 'hsl(32 95% 44%)',
      destructive: isDark ? 'hsl(0 65% 55%)' : 'hsl(0 72% 51%)',
      info:        isDark ? 'hsl(217 80% 58%)' : 'hsl(217 91% 60%)',
      muted:       isDark ? '#3D4E62' : '#CBD5E1',
    },
    legend: { color: isDark ? '#8896AA' : '#64748B' },
  } as const
}

export type ChartTheme = ReturnType<typeof getChartTheme>
