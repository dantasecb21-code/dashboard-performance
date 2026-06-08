'use client'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { fmtBRL, fmtPct } from '@/lib/formatters'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

export default function RankingPage() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Ranking de Lojas</h2>
        <p className="text-sm text-gray-500 mt-0.5">{lojasFiltered.length} lojas · Top 10 por indicador</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingTable lojas={lojasFiltered} valueKey="venda"          formatter={fmtBRL}  title="Maior Venda Acumulada" descending />
        <RankingTable lojas={lojasFiltered} valueKey="venda"          formatter={fmtBRL}  title="Menor Venda Acumulada" descending={false} />
        <RankingTable lojas={lojasFiltered} valueKey="desvio"         formatter={fmtBRL}  title="Acima da Meta em R$" descending />
        <RankingTable lojas={lojasFiltered} valueKey="desvio"         formatter={fmtBRL}  title="Abaixo da Meta em R$" descending={false} />
        <RankingTable lojas={lojasFiltered} valueKey="crescimento"    formatter={v => fmtPct(v)}  title="Maior Crescimento %" descending />
        <RankingTable lojas={lojasFiltered} valueKey="crescimento"    formatter={v => fmtPct(v)}  title="Pior Crescimento %" descending={false} />
        <RankingTable lojas={lojasFiltered} valueKey="ticketMedio"    formatter={fmtBRL}  title="Maior Ticket Médio" descending />
        <RankingTable lojas={lojasFiltered} valueKey="perdaVendaTotal" formatter={fmtBRL} title="Maior Perda de Venda" descending />
        <RankingTable lojas={lojasFiltered} valueKey="cancelamentoTotal" formatter={v => fmtPct(v)} title="Maior Cancelamento" descending />
        <RankingTable lojas={lojasFiltered} valueKey="tempoOnline"    formatter={v => fmtPct(v)}  title="Pior Tempo Online" descending={false} />
      </div>
    </div>
  )
}
