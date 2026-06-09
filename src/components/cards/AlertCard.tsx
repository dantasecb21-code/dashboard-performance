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
      <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-success" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-success">Todas as lojas saudáveis</h3>
          <p className="text-xs text-success mt-0.5">Nenhuma loja com status crítico no período.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-destructive">
            {criticas.length} {criticas.length === 1 ? 'Loja Crítica' : 'Lojas Críticas'} — Atenção Imediata
          </h3>
        </div>
      </div>

      <div className="space-y-1.5">
        {criticas.map(l => (
          <div
            key={l.id}
            className="flex items-center justify-between glass-card rounded-lg px-3 py-2.5 border border-destructive/20 hover:border-destructive/30 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{l.nomeLoja}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {l.cidade} · {l.uf}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <User className="w-3 h-3" />
                  {l.gerenteRegional}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <div className="text-center hidden sm:block">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
                <p className="text-sm font-bold text-destructive tabular-nums">{l.scoreSaude}</p>
              </div>
              <StatusBadge status={l.statusLoja} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
