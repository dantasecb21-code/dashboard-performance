'use client'
import { CHART_THEME } from '@/lib/chartTheme'
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
  const slice = data.slice(0, maxItems)
  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={slice} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="nome" tick={{ fontSize: 9, fill: CHART_THEME.tick }} angle={-40} textAnchor="end" interval={0} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: 11, fill: CHART_THEME.tick }} width={70} />
          <Tooltip formatter={(v: number) => fmtBRL(v)} />
          <Legend verticalAlign="top" />
          <Bar dataKey="meta"  name="Meta"  fill={CHART_THEME.colors.muted} radius={[3,3,0,0]} />
          <Bar dataKey="venda" name="Venda" radius={[3,3,0,0]}>
            {slice.map((entry, i) => (
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
