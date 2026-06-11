import StatusBadge from '@/components/common/StatusBadge'
import type { Loja } from '@/types/dashboard'

interface Props {
  lojas: Loja[]
  valueKey: keyof Loja
  formatter: (v: number | null) => string
  title: string
  descending?: boolean
  max?: number
}

export default function RankingTable({ lojas, valueKey, formatter, title, descending = true, max = 10 }: Props) {
  const sorted = [...lojas]
    .filter(l => l[valueKey] !== null)
    .sort((a, b) => {
      const av = a[valueKey] as number
      const bv = b[valueKey] as number
      return descending ? bv - av : av - bv
    })
    .slice(0, max)

  if (!sorted.length) return (
    <div className="glass-card rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>
    </div>
  )

  return (
    <div className="glass-card rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">{title}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left pb-2 w-5">#</th>
            <th className="text-left pb-2">Loja</th>
            <th className="text-right pb-2 w-24 whitespace-nowrap">Valor</th>
            <th className="text-right pb-2 w-20 whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l, i) => (
            <tr key={l.id} className="border-b border-border hover:bg-slate-50 transition">
              <td className="py-2 font-bold text-muted-foreground align-top">{i + 1}</td>
              <td className="py-2 pr-2 min-w-0 max-w-0">
                <p className="font-medium text-foreground/80 truncate leading-tight">{l.nomeLoja}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {l.cidade}/{l.uf}
                  {l.gerenteRegional ? ` · ${l.gerenteRegional}` : ''}
                </p>
                {l.projetoOlimpo && <span className="text-[9px] text-blue-700 font-semibold">OLIMPO</span>}
              </td>
              <td className="py-2 text-right font-semibold text-foreground whitespace-nowrap align-top">
                {formatter(l[valueKey] as number)}
              </td>
              <td className="py-2 text-right align-top">
                <StatusBadge status={l.statusLoja} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
