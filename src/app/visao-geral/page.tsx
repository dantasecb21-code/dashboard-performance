'use client'
import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useFilters } from '@/context/FilterContext'
import { calcularResumo } from '@/lib/calculations'
import { fmtBRL, fmtBRLCompact, fmtPct } from '@/lib/formatters'
import KpiCard from '@/components/cards/KpiCard'
import AlertCard from '@/components/cards/AlertCard'
import LineChartRevenue from '@/components/charts/LineChartRevenue'
import BarChartGoalVsSales from '@/components/charts/BarChartGoalVsSales'
import RankingTable from '@/components/tables/RankingTable'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

export default function VisaoGeral() {
  const { loading, error, refresh } = useData()
  const { lojasFiltered } = useFilters()

  const resumo = useMemo(() => calcularResumo(lojasFiltered), [lojasFiltered])

  const evolucaoMensal = useMemo(() => {
    const meses = [
      { mes: 'Jan', key: 'faturamentoJaneiro' },
      { mes: 'Fev', key: 'faturamentoFevereiro' },
      { mes: 'Mar', key: 'faturamentoMarco' },
      { mes: 'Abr', key: 'faturamentoAbril' },
      { mes: 'Mai', key: 'faturamentoMaio' },
      { mes: 'Jun', key: 'faturamentoJunho' },
    ] as const
    return meses
      .map(({ mes, key }) => {
        const vals = lojasFiltered.map(l => l[key]).filter((v): v is number => v !== null)
        const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null
        return { mes, valor: total }
      })
      .filter(d => d.valor !== null)
  }, [lojasFiltered])

  const metaVsVendaData = useMemo(() =>
    lojasFiltered
      .filter(l => l.meta !== null || l.venda !== null)
      .sort((a, b) => (b.venda ?? 0) - (a.venda ?? 0))
      .slice(0, 20)
      .map(l => ({ nome: l.nomeLoja.slice(0, 18), meta: l.meta ?? 0, venda: l.venda ?? 0 })),
    [lojasFiltered])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Visão Geral Executiva</h2>
        <p className="text-sm text-gray-500 mt-0.5">{resumo.totalLojas} lojas no período selecionado</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <KpiCard title="Faturamento Total" value={fmtBRLCompact(resumo.faturamentoTotal)} icon="💰" />
        <KpiCard title="Meta Total" value={fmtBRLCompact(resumo.metaTotal)} icon="🎯" />
        <KpiCard title="Desvio vs Meta" value={fmtBRLCompact(resumo.desvioTotal)}
          delta={resumo.desvioPercentual}
          color={resumo.desvioTotal >= 0 ? 'green' : 'red'} icon="📊" />
        <KpiCard title="Crescimento Médio" value={fmtPct(resumo.crescimentoMedio)}
          color={resumo.crescimentoMedio >= 0 ? 'green' : 'red'} icon="📈" />
        <KpiCard title="Ticket Médio" value={fmtBRL(resumo.ticketMedioGeral)} icon="🧾" />
        <KpiCard title="Cancelamento Médio" value={fmtPct(resumo.cancelamentoMedio)}
          subtitle="meta ≤ 5%"
          color={resumo.cancelamentoMedio <= 5 ? 'green' : resumo.cancelamentoMedio <= 7 ? 'yellow' : 'red'} icon="❌" />
        <KpiCard title="Perda de Venda Total" value={fmtBRLCompact(resumo.perdaVendaTotal)} color="red" icon="📉" />
        <KpiCard title="Tempo Online Médio" value={fmtPct(resumo.tempoOnlineMedio)}
          subtitle="meta ≥ 95%"
          color={resumo.tempoOnlineMedio >= 95 ? 'green' : resumo.tempoOnlineMedio >= 85 ? 'yellow' : 'red'} icon="⏱️" />
        <KpiCard title="Lojas Acima da Meta" value={resumo.lojasAcimaMeta} color="green" icon="✅" />
        <KpiCard title="Lojas Abaixo da Meta" value={resumo.lojasBaixoMeta} color="red" icon="⚠️" />
        <KpiCard title="Lojas Críticas" value={resumo.lojasCriticas} color="red" icon="🚨" />
      </div>

      {/* Alerta de lojas críticas */}
      <AlertCard lojas={lojasFiltered} max={8} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChartRevenue data={evolucaoMensal} title="Evolução Mensal de Faturamento" />
        <BarChartGoalVsSales data={metaVsVendaData} title="Meta × Venda (Top 20 lojas)" />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingTable
          lojas={lojasFiltered}
          valueKey="venda"
          formatter={fmtBRL}
          title="Top 10 — Maior Venda Acumulada"
          descending
        />
        <RankingTable
          lojas={lojasFiltered}
          valueKey="desvio"
          formatter={fmtBRL}
          title="Top 10 — Maior Desvio Negativo vs Meta"
          descending={false}
        />
      </div>
    </div>
  )
}
