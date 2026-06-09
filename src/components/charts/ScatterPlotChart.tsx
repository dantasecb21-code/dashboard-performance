'use client'
import { CHART_THEME } from '@/lib/chartTheme'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmtBRLCompact, fmtBRL } from '@/lib/formatters'
import type { Loja } from '@/types/dashboard'

const STATUS_COLOR: Record<string, string> = {
  'Saudável': CHART_THEME.colors.success,
  'Atenção':  CHART_THEME.colors.warning,
  'Crítica':  CHART_THEME.colors.destructive,
}

interface Props { lojas: Loja[]; title?: string }

export default function ScatterPlotChart({ lojas, title }: Props) {
  const data = lojas
    .filter(l => l.venda !== null && l.perdaVendaTotal !== null)
    .map(l => ({
      nome: l.nomeLoja,
      x: l.venda ?? 0,
      y: l.perdaVendaTotal ?? 0,
      status: l.statusLoja,
    }))

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground/80 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis type="number" dataKey="x" name="Venda" tickFormatter={fmtBRLCompact} tick={{ fontSize: 10, fill: CHART_THEME.tick }} />
          <YAxis type="number" dataKey="y" name="Perda" tickFormatter={fmtBRLCompact} tick={{ fontSize: 10, fill: CHART_THEME.tick }} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{ background: 'hsl(220 52% 7%)', border: '1px solid hsl(220 40% 20%)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'hsl(210 22% 96%)' }}>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{d.nome}</p>
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
      <div className="flex gap-4 justify-center mt-2">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />{s}
          </span>
        ))}
      </div>
    </div>
  )
}
