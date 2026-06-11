'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { useIsMobile } from '@/lib/useIsMobile'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { fmtBRLCompact, fmtBRL } from '@/lib/formatters'

interface DataItem {
  nome: string
  meta: number | null
  venda: number | null
}

interface Props {
  data: DataItem[]
  title?: string
  maxItems?: number
}

export default function BarChartGoalVsSales({ data, title, maxItems = 15 }: Props) {
  const isMobile = useIsMobile()
  const limit = isMobile ? 8 : maxItems
  const slice = data.slice(0, limit)
  const height = isMobile ? 260 : 300
  const bottomMargin = isMobile ? 55 : 40
  const maxLabel = isMobile ? 10 : 16

  const chartData = slice.map(d => ({
    ...d,
    nome: d.nome.length > maxLabel ? d.nome.slice(0, maxLabel) + '…' : d.nome,
  }))

  return (
    <div className="glass-card p-4">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: bottomMargin }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="nome" tick={{ fontSize: isMobile ? 8 : 9, fill: CHART_THEME.tick }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: isMobile ? 9 : 11, fill: CHART_THEME.tick }} width={isMobile ? 52 : 70} />
          <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
          <Bar dataKey="meta" name="Meta" fill={CHART_THEME.colors.muted} radius={[3, 3, 0, 0]} />
          <Bar dataKey="venda" name="Venda" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={
                entry.venda === null || entry.meta === null ? CHART_THEME.colors.muted
                  : entry.venda >= entry.meta ? '#16a34a' : CHART_THEME.colors.destructive
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
