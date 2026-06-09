'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtPct } from '@/lib/formatters'

interface Props {
  data: Record<string, unknown>[]
  keys: { dataKey: string; name: string; color: string }[]
  title?: string
  xKey?: string
  formatter?: (v: number) => string
}

export default function StackedBarChart({ data, keys, title, xKey = 'nome', formatter = fmtPct }: Props) {
  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: CHART_THEME.tick }} angle={-40} textAnchor="end" interval={0} />
          <YAxis tickFormatter={formatter} tick={{ fontSize: 10, fill: CHART_THEME.tick }} />
          <Tooltip formatter={(v: number) => formatter(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend verticalAlign="top" />
          {keys.map(k => (
            <Bar key={k.dataKey} dataKey={k.dataKey} name={k.name} fill={k.color} stackId="a" radius={[0,0,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
