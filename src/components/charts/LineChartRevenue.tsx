'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DadosMensais } from '@/types/dashboard'
import { fmtBRLCompact } from '@/lib/formatters'

interface Props {
  data: DadosMensais[]
  title?: string
}

export default function LineChartRevenue({ data, title }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: 11 }} width={70} />
          <Tooltip formatter={(v: number) => fmtBRLCompact(v)} />
          <Line type="monotone" dataKey="valor" name="Faturamento" stroke="#4f6ef7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
