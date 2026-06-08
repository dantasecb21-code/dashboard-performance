'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtPct } from '@/lib/formatters'

interface Props {
  data: Record<string, unknown>[]
  keys: { dataKey: string; name: string; color: string }[]
  title?: string
  xKey?: string
  formatter?: (v: number) => string
}

export default function StackedBarChart({ data, keys, title, xKey = 'nome', formatter = fmtPct }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 9 }} angle={-40} textAnchor="end" interval={0} />
          <YAxis tickFormatter={formatter} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: number) => formatter(v)} />
          <Legend verticalAlign="top" />
          {keys.map(k => (
            <Bar key={k.dataKey} dataKey={k.dataKey} name={k.name} fill={k.color} stackId="a" radius={[0,0,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
