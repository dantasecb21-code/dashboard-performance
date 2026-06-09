import clsx from 'clsx'
import type { Loja } from '@/types/dashboard'
import { statusIndicador } from '@/lib/statusRules'
import { fmtPct } from '@/lib/formatters'

const COR: Record<string, string> = {
  verde:    'bg-success/15 text-success',
  amarelo:  'bg-warning/15 text-warning',
  vermelho: 'bg-red-100 text-destructive',
  neutro:   'bg-white/[0.06] text-gray-400',
}

function Cell({ valor, indicador, className }: { valor: number | null; indicador: Parameters<typeof statusIndicador>[0]; className?: string }) {
  const cor = statusIndicador(indicador, valor)
  return (
    <td className={clsx('px-2 py-1.5 text-center text-xs font-medium rounded', COR[cor], className)}>
      {valor !== null ? fmtPct(valor) : '—'}
    </td>
  )
}

interface Props { lojas: Loja[] }

export default function OperationalHeatmap({ lojas }: Props) {
  if (!lojas.length) return null
  return (
    <div className="glass-card rounded-xl border border-white/[0.06] shadow-sm overflow-auto">
      <table className="w-full text-xs min-w-[480px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-gray-400">
            <th className="text-left px-3 sm:px-4 py-2.5">Loja</th>
            <th className="text-left px-2 py-2.5 hidden md:table-cell">Cidade/UF</th>
            <th className="text-center px-2 py-2.5">Cancel.</th>
            <th className="text-center px-2 py-2.5 hidden sm:table-cell">SLA Prep.</th>
            <th className="text-center px-2 py-2.5 hidden sm:table-cell">NSU</th>
            <th className="text-center px-2 py-2.5 hidden md:table-cell">Ruptura</th>
            <th className="text-center px-2 py-2.5 hidden lg:table-cell">SLA Entr.</th>
            <th className="text-center px-2 py-2.5">Tempo On</th>
            <th className="text-center px-2 py-2.5">Score</th>
          </tr>
        </thead>
        <tbody>
          {lojas.map(l => (
            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-3 sm:px-4 py-2">
                <p className="font-medium text-foreground/80 leading-tight">{l.nomeLoja}</p>
                <p className="text-[10px] text-gray-400 md:hidden">{l.cidade}/{l.uf}</p>
              </td>
              <td className="px-2 py-2 text-muted-foreground hidden md:table-cell">{l.cidade}/{l.uf}</td>
              <Cell valor={l.cancelamentoTotal} indicador="cancelamento_total" />
              <Cell valor={l.slaPreparo}        indicador="sla_preparo" className="hidden sm:table-cell" />
              <Cell valor={l.nsu}               indicador="nsu"          className="hidden sm:table-cell" />
              <Cell valor={l.rupturaItem}       indicador="ruptura_item" className="hidden md:table-cell" />
              <Cell valor={l.slaEntrega}        indicador="sla_entrega"  className="hidden lg:table-cell" />
              <Cell valor={l.tempoOnline}       indicador="tempo_online" />
              <td className="px-2 py-1.5 text-center font-semibold text-foreground/80">{l.scoreSaude}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
