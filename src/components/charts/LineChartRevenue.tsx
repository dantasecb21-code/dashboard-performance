'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { useIsMobile } from '@/lib/useIsMobile'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DadosMensais } from '@/types/dashboard'
import { fmtBRL, fmtBRLCompact } from '@/lib/formatters'

interface Props {
  data: DadosMensais[]
  title?: string
}

interface LabelProps {
  x?: number
  y?: number
  value?: number
}

function ValueLabel({ x = 0, y = 0, value }: LabelProps) {
  if (value === null || value === undefined) return null
  return (
    <g transform={`translate(${x},${y - 14})`}>
      <text textAnchor="middle" fill={CHART_THEME.colors.primary} fontSize={10} fontWeight={600}>
        {fmtBRL(value)}
      </text>
    </g>
  )
}

export default function LineChartRevenue({ data, title }: Props) {
  const isMobile = useIsMobile()

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}

      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs border-collapse min-w-[280px]">
          <thead>
            <tr>
              {data.map(d => (
                <th key={d.mes} className="px-2 py-1 text-center text-muted-foreground font-medium border-b border-white/[0.06]">
                  {d.mes}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {data.map(d => (
                <td key={d.mes} className="px-1 py-1 text-center font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">
                  {fmtBRL(d.valor)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
        <LineChart data={data} margin={{ top: isMobile ? 8 : 28, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="mes" tick={{ fontSize: isMobile ? 10 : 11, fill: CHART_THEME.tick }} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: isMobile ? 9 : 11, fill: CHART_THEME.tick }} width={isMobile ? 50 : 70} />
          <Tooltip
            formatter={(v: number) => [fmtBRL(v), 'Faturamento']}
            contentStyle={CHART_THEME.tooltip.contentStyle}
          />
          <Line
            type="monotone"
            dataKey="valor"
            name="Faturamento"
            stroke={CHART_THEME.colors.primary}
            strokeWidth={2}
            dot={{ r: isMobile ? 3 : 5, fill: CHART_THEME.colors.primary }}
            activeDot={{ r: isMobile ? 5 : 7 }}
            label={isMobile ? undefined : <ValueLabel />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
