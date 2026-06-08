import type { Loja } from '@/types/dashboard'
import StatusBadge from '@/components/common/StatusBadge'
import { fmtPct } from '@/lib/formatters'

interface Props { lojas: Loja[]; max?: number }

export default function AlertCard({ lojas, max = 5 }: Props) {
  const criticas = lojas
    .filter(l => l.statusLoja === 'Crítica')
    .sort((a, b) => a.scoreSaude - b.scoreSaude)
    .slice(0, max)

  if (criticas.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-700 mb-1">Nenhuma loja crítica</h3>
        <p className="text-sm text-green-600">Todas as lojas estão com desempenho adequado.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <h3 className="font-semibold text-red-700 mb-3">Lojas Críticas — Atenção Imediata</h3>
      <div className="space-y-2">
        {criticas.map(l => (
          <div key={l.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{l.nomeLoja}</p>
              <p className="text-xs text-gray-500">{l.cidade} · {l.uf} · {l.gerenteRegional}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500">Score {l.scoreSaude}</span>
              <StatusBadge status={l.statusLoja} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
