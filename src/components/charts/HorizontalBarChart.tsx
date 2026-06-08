'use client'
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
  referencia?: number
}

export default function HorizontalBarChart({ data, title, formatter = String, referencia }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tickFormatter={formatter} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={130} />
          <Tooltip formatter={(v: number) => formatter(v)} />
          <Bar dataKey="valor" radius={[0,3,3,0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.cor ?? '#4f6ef7'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
