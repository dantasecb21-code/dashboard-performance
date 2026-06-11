'use client'
import { getChartTheme } from '@/lib/chartTheme'
import { useTheme } from '@/context/ThemeContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmtBRLCompact, fmtBRL } from '@/lib/formatters'
import type { Loja } from '@/types/dashboard'

const STATUS_COLOR: Record<string, string> = {
  'Saudável': 'hsl(142 72% 29%)',
  'Atenção':  'hsl(32 95% 44%)',
  'Crítica':  'hsl(0 72% 51%)',
}

interface Props { lojas: Loja[]; title?: string }

export default function ScatterPlotChart({ lojas, title }: Props) {
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const CHART_THEME = getChartTheme(theme === 'dark')
  const data = lojas
    .filter(l => l.venda !== null && l.perdaVendaTotal !== null)
    .map(l => ({
      nome: l.nomeLoja,
      x: l.venda ?? 0,
      y: l.perdaVendaTotal ?? 0,
      status: l.statusLoja,
    }))

  return (
    <div className="glass-card p-4">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
        <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis type="number" dataKey="x" name="Venda" tickFormatter={fmtBRLCompact} tick={{ fontSize: isMobile ? 9 : 10, fill: CHART_THEME.tick }} width={isMobile ? 44 : 60} />
          <YAxis type="number" dataKey="y" name="Perda" tickFormatter={fmtBRLCompact} tick={{ fontSize: isMobile ? 9 : 10, fill: CHART_THEME.tick }} width={isMobile ? 44 : 56} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{ ...CHART_THEME.tooltip.contentStyle, padding: '8px 12px' }}>
                  <p style={{ ...CHART_THEME.tooltip.labelStyle, fontWeight: 700, marginBottom: 4 }}>{d.nome}</p>
                  <p>Venda: {fmtBRL(d.x)}</p>
                  <p>Perda: {fmtBRL(d.y)}</p>
                </div>
              )
            }}
          />
          <Scatter data={data}>
            {data.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLOR[entry.status] ?? '#9ca3af'} fillOpacity={0.7} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2 flex-wrap">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />{s}
          </span>
        ))}
      </div>
    </div>
  )
}
