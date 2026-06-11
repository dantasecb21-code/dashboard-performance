'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { useIsMobile } from '@/lib/useIsMobile'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DataItem {
  nome: string
  valor: number | null
  cor?: string
}

interface Props {
  data: DataItem[]
  title?: string
  formatter?: (v: number) => string
  tooltipFormatter?: (v: number) => string
  referencia?: number
}

export default function HorizontalBarChart({ data, title, formatter = String, tooltipFormatter }: Props) {
  const isMobile = useIsMobile()
  const tipFmt = tooltipFormatter ?? formatter
  const yAxisWidth = isMobile ? 90 : 130
  const maxLabel = isMobile ? 14 : 22
  const chartData = data.map(d => ({ ...d, nome: d.nome.length > maxLabel ? d.nome.slice(0, maxLabel) + '…' : d.nome }))

  return (
    <div className="glass-card p-4">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * (isMobile ? 28 : 32))}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: isMobile ? 24 : 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
          <XAxis type="number" tickFormatter={formatter} tick={{ fontSize: isMobile ? 9 : 10, fill: CHART_THEME.tick }} />
          <YAxis type="category" dataKey="nome" tick={{ fontSize: isMobile ? 9 : 10, fill: CHART_THEME.tick }} width={yAxisWidth} />
          <Tooltip formatter={(v: number) => tipFmt(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
          <Bar dataKey="valor" radius={[0, 3, 3, 0]}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.cor ?? '#4f6ef7'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
