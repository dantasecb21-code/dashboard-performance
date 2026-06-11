'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { useIsMobile } from '@/lib/useIsMobile'
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
  const isMobile = useIsMobile()
  const limit = isMobile ? 8 : data.length
  const maxLabel = isMobile ? 10 : 16
  const chartData = data.slice(0, limit).map(d => ({
    ...d,
    [xKey]: typeof d[xKey] === 'string' && (d[xKey] as string).length > maxLabel
      ? (d[xKey] as string).slice(0, maxLabel) + '…'
      : d[xKey],
  }))

  return (
    <div className="glass-card p-4">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 280}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: isMobile ? 55 : 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey={xKey} tick={{ fontSize: isMobile ? 8 : 9, fill: CHART_THEME.tick }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tickFormatter={formatter} tick={{ fontSize: isMobile ? 9 : 10, fill: CHART_THEME.tick }} width={isMobile ? 36 : 48} />
          <Tooltip formatter={(v: number) => formatter(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
          {keys.map(k => (
            <Bar key={k.dataKey} dataKey={k.dataKey} name={k.name} fill={k.color} stackId="a" radius={[0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
