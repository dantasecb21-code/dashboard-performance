'use client'
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
      <text
        textAnchor="middle"
        fill="#4f6ef7"
        fontSize={10}
        fontWeight={600}
      >
        {fmtBRL(value)}
      </text>
    </g>
  )
}

export default function LineChartRevenue({ data, title }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}

      {/* Tabela de valores exatos abaixo do gráfico */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {data.map(d => (
                <th key={d.mes} className="px-2 py-1 text-center text-gray-400 font-medium border-b border-gray-100">
                  {d.mes}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {data.map(d => (
                <td key={d.mes} className="px-2 py-1 text-center font-semibold text-gray-800 whitespace-nowrap">
                  {fmtBRL(d.valor)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtBRLCompact} tick={{ fontSize: 11 }} width={70} />
          <Tooltip
            formatter={(v: number) => [fmtBRL(v), 'Faturamento']}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            name="Faturamento"
            stroke="#4f6ef7"
            strokeWidth={2}
            dot={{ r: 5, fill: '#4f6ef7' }}
            activeDot={{ r: 7 }}
            label={<ValueLabel />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
