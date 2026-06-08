'use client'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmtBRLCompact, fmtBRL } from '@/lib/formatters'
import type { Loja } from '@/types/dashboard'

const STATUS_COLOR: Record<string, string> = {
  'Saudável': '#16a34a',
  'Atenção':  '#d97706',
  'Crítica':  '#dc2626',
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" dataKey="x" name="Venda" tickFormatter={fmtBRLCompact} tick={{ fontSize: 10 }} />
          <YAxis type="number" dataKey="y" name="Perda" tickFormatter={fmtBRLCompact} tick={{ fontSize: 10 }} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow">
                  <p className="font-semibold">{d.nome}</p>
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
          <span key={s} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />{s}
          </span>
        ))}
      </div>
    </div>
  )
}
