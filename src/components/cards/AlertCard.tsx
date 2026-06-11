import type { Loja } from '@/types/dashboard'
import StatusBadge from '@/components/common/StatusBadge'
import { AlertTriangle, CheckCircle2, MapPin, User } from 'lucide-react'

interface Props { lojas: Loja[]; max?: number }

export default function AlertCard({ lojas, max = 5 }: Props) {
  const criticas = lojas
    .filter(l => l.statusLoja === 'Crítica')
    .sort((a, b) => a.scoreSaude - b.scoreSaude)
    .slice(0, max)

  if (criticas.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-green-700">Todas as lojas saudáveis</h3>
          <p className="text-xs text-green-600 mt-0.5">Nenhuma loja com status crítico no período.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-red-700">
          {criticas.length} {criticas.length === 1 ? 'Loja Crítica' : 'Lojas Críticas'} — Atenção Imediata
        </h3>
      </div>

      <div className="space-y-1.5">
        {criticas.map(l => (
          <div
            key={l.id}
            className="glass-card flex items-center justify-between rounded-xl px-3 py-2.5
              border-red-100 hover:border-red-200 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{l.nomeLoja}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0">
                  <MapPin className="w-3 h-3" />
                  {l.cidade} · {l.uf}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{l.gerenteRegional}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <div className="text-center hidden sm:block">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Score</p>
                <p className="text-sm font-bold tabular-nums text-red-700">{l.scoreSaude}</p>
              </div>
              <StatusBadge status={l.statusLoja} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
