'use client'
import { CHART_THEME } from '@/lib/chartTheme'
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

export default function HorizontalBarChart({ data, title, formatter = String, tooltipFormatter, referencia }: Props) {
  const tipFmt = tooltipFormatter ?? formatter
  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
          <XAxis type="number" tickFormatter={formatter} tick={{ fontSize: 10, fill: CHART_THEME.tick }} />
          <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: CHART_THEME.tick }} width={130} />
          <Tooltip formatter={(v: number) => tipFmt(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="valor" radius={[0,3,3,0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.cor ?? '#4f6ef7'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
