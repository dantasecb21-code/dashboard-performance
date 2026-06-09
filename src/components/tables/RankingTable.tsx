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
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">{title}</h3>
      <p className="text-sm text-gray-400">Sem dados suficientes.</p>
    </div>
  )

  return (
    <div className="glass-card rounded-xl border border-white/[0.06] p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">{title}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-white/[0.06]">
            <th className="text-left pb-2 w-6">#</th>
            <th className="text-left pb-2">Loja</th>
            <th className="text-left pb-2 hidden sm:table-cell">Cidade/UF</th>
            <th className="text-left pb-2 hidden md:table-cell">Gerente</th>
            <th className="text-right pb-2">Valor</th>
            <th className="text-right pb-2 w-20">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l, i) => (
            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="py-2 font-bold text-gray-400">{i + 1}</td>
              <td className="py-2">
                <p className="font-medium text-foreground/80">{l.nomeLoja}</p>
                {l.projetoOlimpo && <span className="text-[9px] text-blue-500 font-semibold">OLIMPO</span>}
              </td>
              <td className="py-2 text-muted-foreground hidden sm:table-cell">{l.cidade}/{l.uf}</td>
              <td className="py-2 text-muted-foreground hidden md:table-cell">{l.gerenteRegional}</td>
              <td className="py-2 text-right font-semibold text-gray-900">{formatter(l[valueKey] as number)}</td>
              <td className="py-2 text-right"><StatusBadge status={l.statusLoja} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
