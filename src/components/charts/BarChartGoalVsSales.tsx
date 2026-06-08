'use client'
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={slice} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="nome" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" interval={0} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: 11 }} width={70} />
          <Tooltip formatter={(v: number) => fmtBRL(v)} />
          <Legend verticalAlign="top" />
          <Bar dataKey="meta"  name="Meta"  fill="#e5e7eb" radius={[3,3,0,0]} />
          <Bar dataKey="venda" name="Venda" radius={[3,3,0,0]}>
            {slice.map((entry, i) => (
              <Cell key={i} fill={
                entry.venda === null || entry.meta === null ? '#9ca3af'
                  : entry.venda >= entry.meta ? '#16a34a' : '#dc2626'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
