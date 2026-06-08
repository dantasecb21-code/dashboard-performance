import clsx from 'clsx'
import type { Loja } from '@/types/dashboard'
import { statusIndicador } from '@/lib/statusRules'
import { fmtPct } from '@/lib/formatters'

const COR: Record<string, string> = {
  verde:    'bg-green-100 text-green-800',
  amarelo:  'bg-yellow-100 text-yellow-800',
  vermelho: 'bg-red-100 text-red-800',
  neutro:   'bg-gray-100 text-gray-400',
}

function Cell({ valor, indicador }: { valor: number | null; indicador: Parameters<typeof statusIndicador>[0] }) {
  const cor = statusIndicador(indicador, valor)
  return (
    <td className={clsx('px-2 py-1.5 text-center text-xs font-medium rounded', COR[cor])}>
      {valor !== null ? fmtPct(valor) : '—'}
    </td>
  )
}

interface Props { lojas: Loja[] }

export default function OperationalHeatmap({ lojas }: Props) {
  if (!lojas.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-auto">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400">
            <th className="text-left px-4 py-2.5">Loja</th>
            <th className="text-left px-2 py-2.5 hidden sm:table-cell">Cidade/UF</th>
            <th className="text-center px-2 py-2.5">Cancelamento</th>
            <th className="text-center px-2 py-2.5">SLA Preparo</th>
            <th className="text-center px-2 py-2.5">NSU</th>
            <th className="text-center px-2 py-2.5">Ruptura</th>
            <th className="text-center px-2 py-2.5">SLA Entrega</th>
            <th className="text-center px-2 py-2.5">Tempo On</th>
            <th className="text-center px-2 py-2.5">Score</th>
          </tr>
        </thead>
        <tbody>
          {lojas.map(l => (
            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-2">
                <p className="font-medium text-gray-800">{l.nomeLoja}</p>
              </td>
              <td className="px-2 py-2 text-gray-500 hidden sm:table-cell">{l.cidade}/{l.uf}</td>
              <Cell valor={l.cancelamentoTotal} indicador="cancelamento_total" />
              <Cell valor={l.slaPreparo}        indicador="sla_preparo" />
              <Cell valor={l.nsu}               indicador="nsu" />
              <Cell valor={l.rupturaItem}       indicador="ruptura_item" />
              <Cell valor={l.slaEntrega}        indicador="sla_entrega" />
              <Cell valor={l.tempoOnline}       indicador="tempo_online" />
              <td className="px-2 py-1.5 text-center font-semibold text-gray-700">{l.scoreSaude}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
