'use client'
import { getChartTheme } from '@/lib/chartTheme'
import { useTheme } from '@/context/ThemeContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtPct } from '@/lib/formatters'

interface DataItem { name: string; value: number; color: string }
interface Props { data: DataItem[]; title?: string }

export default function DonutChart({ data, title }: Props) {
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const CHART_THEME = getChartTheme(theme === 'dark')
  const innerR = isMobile ? 45 : 60
  const outerR = isMobile ? 72 : 90

  return (
    <div className="glass-card p-4">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
            dataKey="value"
            nameKey="name"
            label={isMobile ? undefined : ({ name, percent }) => `${name} ${fmtPct(percent * 100, 0)}`}
            labelLine={!isMobile}
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={CHART_THEME.tooltip.contentStyle} itemStyle={CHART_THEME.tooltip.itemStyle} labelStyle={CHART_THEME.tooltip.labelStyle} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
