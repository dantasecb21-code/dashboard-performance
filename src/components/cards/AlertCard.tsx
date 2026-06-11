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
      <div className="rounded-xl border border-[hsl(143_78%_46%/0.25)] bg-[hsl(143_78%_46%/0.07)] p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[hsl(143_78%_46%/0.15)] flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-[hsl(143_78%_55%)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[hsl(143_78%_60%)]">Todas as lojas saudáveis</h3>
          <p className="text-xs text-[hsl(143_78%_46%/0.7)] mt-0.5">Nenhuma loja com status crítico no período.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[hsl(349_100%_61%/0.25)] bg-[hsl(349_100%_61%/0.06)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[hsl(349_100%_61%/0.15)] flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-[hsl(349_100%_65%)]" />
        </div>
        <h3 className="text-sm font-semibold text-[hsl(349_100%_68%)]">
          {criticas.length} {criticas.length === 1 ? 'Loja Crítica' : 'Lojas Críticas'} — Atenção Imediata
        </h3>
      </div>

      <div className="space-y-1.5">
        {criticas.map(l => (
          <div
            key={l.id}
            className="glass-card flex items-center justify-between rounded-xl px-3 py-2.5
              border-[hsl(349_100%_61%/0.18)] hover:border-[hsl(349_100%_61%/0.32)] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{l.nomeLoja}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-[hsl(218_18%_42%)] flex-shrink-0">
                  <MapPin className="w-3 h-3" />
                  {l.cidade} · {l.uf}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[hsl(218_18%_42%)] min-w-0">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{l.gerenteRegional}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <div className="text-center hidden sm:block">
                <p className="text-[10px] text-[hsl(218_18%_40%)] uppercase tracking-wide">Score</p>
                <p className="text-sm font-bold tabular-nums text-[hsl(349_100%_68%)]">{l.scoreSaude}</p>
              </div>
              <StatusBadge status={l.statusLoja} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
