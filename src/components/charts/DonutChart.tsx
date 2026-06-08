'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtPct } from '@/lib/formatters'

interface DataItem { name: string; value: number; color: string }
interface Props { data: DataItem[]; title?: string }

export default function DonutChart({ data, title }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
            dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${fmtPct(percent * 100, 0)}`}
            labelLine={false}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => fmtPct(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
